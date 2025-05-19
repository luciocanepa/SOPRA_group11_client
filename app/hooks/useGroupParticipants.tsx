// hooks/useGroupParticipants.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";

export interface Participant {
  id: number;
  username: string;
  status: "ONLINE" | "OFFLINE" | "WORK" | "BREAK";
}
export interface TimerInfo {
  start: Date;
  duration: number; // seconds
  running: boolean;
}

interface GroupUserDTO {
  id: number;
  username: string;
  status: Participant["status"];
  startTime: string; // ISO
  duration: string; // PT##M##S
}
interface GroupResponse {
  users: GroupUserDTO[];
}

type TimerUpdateMsg = {
  type: "TIMER_UPDATE";
  userId: string;
  status: Participant["status"];
  startTime: string;
  duration: string;
};
type StatusMsg = {
  type: "STATUS";
  userId: string;
  status: Participant["status"];
};
type SyncMsg = {
  type: "SYNC";
  senderId: string;
  senderName: string;
  status: Participant["status"];
  startTime: string; // original ISO (no longer used for anchor)
  duration: string; // original PT##M##S
  secondDuration: string; // remaining PT##M##S at send-time
};
type WSMessage = TimerUpdateMsg | StatusMsg | SyncMsg;

export function useGroupParticipants(
  groupId: string,
  token: string | null,
  onSync?: (req: {
    senderId: string;
    senderName: string;
    status: Participant["status"];
    startTime: string; // NOW when the message was received
    duration: string; // PT##M##S remaining at send-time
  }) => void,
) {
  const api = useApi();
  const { value: localUserId } = useLocalStorage<string>("id", "");
  const clientRef = useRef<Client | null>(null);

  // swallow exactly one echo of our own SYNC
  const ignoreOwnSyncRef = useRef(false);

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [timers, setTimers] = useState<Record<number, TimerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // parse PT##M##S → seconds
  const parseIso = (iso: string): number => {
    const m = Number((iso.match(/PT(\d+)M/) || [])[1] || 0);
    const s = Number((iso.match(/(\d+)S/) || [])[1] || 0);
    return m * 60 + s;
  };

  // 1) initial REST load
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .get<GroupResponse>(`/groups/${groupId}`, token)
      .then((res) => {
        setParticipants(
          res.users.map((u) => ({
            id: u.id,
            username: u.username,
            status: u.status,
          })),
        );
        const initial: Record<number, TimerInfo> = {};
        res.users.forEach((u) => {
          if (u.status === "WORK" || u.status === "BREAK") {
            const ts = u.startTime.endsWith("Z")
              ? u.startTime
              : u.startTime + "Z";
            initial[u.id] = {
              start: new Date(ts),
              duration: parseIso(u.duration),
              running: u.status === "WORK",
            };
          }
        });
        setTimers(initial);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load participants");
      })
      .finally(() => setLoading(false));
  }, [groupId, token, api]);

  // 2) unified WS handler
  const handleMessage = useCallback(
    (raw: WSMessage) => {
      switch (raw.type) {
        case "TIMER_UPDATE": {
          const uid = Number(raw.userId);
          if (isNaN(uid)) return;
          const secs = parseIso(raw.duration);
          const tsIso = raw.startTime.endsWith("Z")
            ? raw.startTime
            : raw.startTime + "Z";
          const start = new Date(tsIso);
          const running = raw.status === "WORK" || raw.status === "BREAK";

          setParticipants((ps) =>
            ps.map((u) => (u.id === uid ? { ...u, status: raw.status } : u)),
          );
          setTimers((ts) => ({
            ...ts,
            [uid]: { start, duration: secs, running },
          }));
          break;
        }

        case "STATUS": {
          const uid = Number(raw.userId);
          if (isNaN(uid)) return;
          setParticipants((ps) =>
            ps.map((u) => (u.id === uid ? { ...u, status: raw.status } : u)),
          );
          break;
        }

        case "SYNC": {
          // belt-and-suspenders: never process our own
          if (String(raw.senderId) === String(localUserId)) return;

          // remaining seconds straightforward
          const remSecs = parseIso(raw.secondDuration);
          // anchor at *receive* time
          const start = new Date();
          const running = raw.status === "WORK" || raw.status === "BREAK";
          const uid = Number(raw.senderId);
          if (isNaN(uid)) return;

          setParticipants((ps) =>
            ps.map((u) => (u.id === uid ? { ...u, status: raw.status } : u)),
          );
          setTimers((ts) => ({
            ...ts,
            [uid]: { start, duration: remSecs, running },
          }));

          // notify GroupPage with receive-time
          onSync?.({
            senderId: raw.senderId,
            senderName: raw.senderName,
            status: raw.status,
            startTime: start.toISOString(),
            duration: raw.secondDuration,
          });
          break;
        }
      }
    },
    [localUserId, onSync],
  );

  // 3) connect & subscribe (only after localUserId is known)
  useEffect(() => {
    if (!token || !localUserId || typeof window === "undefined") return;

    const sock = new SockJS(`${getApiDomain()}/ws`);
    const client = new Client({
      webSocketFactory: () => sock,
      connectHeaders: { Authorization: token },
      debug: () => {},
      onStompError: (f) => console.error("STOMP error:", f.headers["message"]),
    });

    client.onConnect = () => {
      client.subscribe(`/topic/group.${groupId}`, (m: IMessage) => {
        try {
          const msg = JSON.parse(m.body) as WSMessage;
          // drop exactly one own SYNC echo
          if (
            msg.type === "SYNC" &&
            String(msg.senderId) === String(localUserId) &&
            ignoreOwnSyncRef.current
          ) {
            ignoreOwnSyncRef.current = false;
            return;
          }
          handleMessage(msg);
        } catch (e) {
          console.error("Invalid WS payload", e);
        }
      });
    };

    client.activate();
    clientRef.current = client;
    return () => {
      client.deactivate();
    };
  }, [groupId, token, localUserId, handleMessage]);

  // 4) publish only
  const requestSync = useCallback(() => {
    if (!clientRef.current || !localUserId) return;
    ignoreOwnSyncRef.current = true;

    const me = Number(localUserId);
    const ti = timers[me];
    const rem = ti
      ? Math.ceil((ti.start.getTime() + ti.duration * 1000 - Date.now()) / 1000)
      : 0;
    const mins = Math.floor(rem / 60),
      secs = rem % 60;
    const isoDur = `PT${mins}M${secs}S`;

    clientRef.current.publish({
      destination: "/app/group.sync",
      headers: { Authorization: token! },
      body: JSON.stringify({
        senderId: me.toString(),
        groupId,
        secondDuration: isoDur,
      }),
    });
  }, [groupId, localUserId, timers, token]);

  return { participants, timers, loading, error, requestSync };
}
