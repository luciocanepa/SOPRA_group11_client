// hooks/useGroupParticipants.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";

export interface Participant {
    id:       number;
    username: string;
    status:   "ONLINE"|"OFFLINE"|"WORK"|"BREAK";
}
export interface TimerInfo {
    start:    Date;
    duration: number;   // seconds
    running:  boolean;
}

interface GroupUserDTO {
    id:        number;
    username:  string;
    status:    Participant["status"];
    startTime: string; // ISO
    duration:  string; // PT##M##S
}
interface GroupResponse { users: GroupUserDTO[]; }

type TimerUpdateMsg = {
    type:      "TIMER_UPDATE";
    userId:    string;
    status:    Participant["status"];
    startTime: string;
    duration:  string;
};
type StatusMsg = {
    type:   "STATUS";
    userId: string;
    status: Participant["status"];
};
type SyncMsg = {
    type:           "SYNC";
    senderId:       string;
    senderName:     string;
    status:         Participant["status"];
    startTime:      string;
    duration:       string; // remaining PT##M##S
    secondDuration: string; // full PT##M##S of other phase
};
type WSMessage = TimerUpdateMsg | StatusMsg | SyncMsg;

export function useGroupParticipants(
    groupId: string,
    token:   string | null,
    onSync?: (req: {
        senderId:       string;
        senderName:     string;
        status:         Participant["status"];
        startTime:      string;
        duration:       string;
        secondDuration: string;
    }) => void
) {
    const api           = useApi();
    const { value: localUserId } = useLocalStorage<string>("id", "");
    const clientRef     = useRef<Client|null>(null);
    const ignoreOwnSync = useRef(false);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [timers,       setTimers]       = useState<Record<number,TimerInfo>>({});
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState<string|null>(null);

    const parseIso = (iso: string): number => {
        const m = Number((iso.match(/PT(\d+)M/)||[])[1]||0);
        const s = Number((iso.match(/(\d+)S/)  ||[])[1]||0);
        return m*60 + s;
    };

    // 1) initial load
    useEffect(() => {
        if (!token) return;
        setLoading(true);
        api.get<GroupResponse>(`/groups/${groupId}`, token)
            .then(res => {
                setParticipants(res.users.map(u => ({
                    id: u.id, username: u.username, status: u.status
                })));
                const initial: Record<number,TimerInfo> = {};
                res.users.forEach(u => {
                    if (u.status==="WORK"||u.status==="BREAK") {
                        const ts = u.startTime.endsWith("Z")
                            ? u.startTime
                            : u.startTime + "Z";
                        initial[u.id] = {
                            start:    new Date(ts),
                            duration: parseIso(u.duration),
                            // BREAK now running!
                            running:  u.status==="WORK" || u.status==="BREAK"
                        };
                    }
                });
                setTimers(initial);
                setError(null);
            })
            .catch(() => setError("Failed to load participants"))
            .finally(() => setLoading(false));
    }, [groupId, token, api]);

    // 2) WS handler
    const handleMessage = useCallback((raw: WSMessage) => {
        switch(raw.type) {
            case "TIMER_UPDATE": {
                const uid = Number(raw.userId);
                if (isNaN(uid)) return;
                const secs  = parseIso(raw.duration);
                const start = new Date(
                    raw.startTime.endsWith("Z")
                        ? raw.startTime
                        : raw.startTime+"Z"
                );
                const running = raw.status==="WORK" || raw.status==="BREAK";
                setParticipants(ps =>
                    ps.map(u => u.id===uid?{...u,status:raw.status}:u)
                );
                setTimers(ts => ({
                    ...ts,
                    [uid]: { start, duration: secs, running }
                }));
                break;
            }
            case "STATUS": {
                const uid = Number(raw.userId);
                if (isNaN(uid)) return;
                setParticipants(ps =>
                    ps.map(u => u.id===uid?{...u,status:raw.status}:u)
                );
                break;
            }
            case "SYNC": {
                if (String(raw.senderId)===String(localUserId)) return;
                const remSecs = parseIso(raw.duration);
                const start   = new Date(
                    raw.startTime.endsWith("Z")
                        ? raw.startTime
                        : raw.startTime+"Z"
                );
                const running = raw.status==="WORK" || raw.status==="BREAK";
                const uid     = Number(raw.senderId);
                if (isNaN(uid)) return;
                setParticipants(ps =>
                    ps.map(u => u.id===uid?{...u,status:raw.status}:u)
                );
                setTimers(ts => ({
                    ...ts,
                    [uid]: { start, duration: remSecs, running }
                }));
                onSync?.({
                    senderId: raw.senderId,
                    senderName: raw.senderName,
                    status: raw.status,
                    startTime: start.toISOString(),
                    duration: raw.duration,
                    secondDuration: raw.secondDuration
                });
                break;
            }
        }
    }, [localUserId, onSync]);

    // 3) connect
    useEffect(() => {
        if (!token || !localUserId || typeof window==="undefined") return;
        const sock = new SockJS(`${getApiDomain()}/ws`);
        const client = new Client({
            webSocketFactory: () => sock,
            connectHeaders:  { Authorization: token },
            debug:           ()=>{},
            onStompError:    f => console.error("STOMP error:", f.headers["message"])
        });
        client.onConnect = () => {
            client.subscribe(`/topic/group.${groupId}`, (m:IMessage) => {
                const msg = JSON.parse(m.body) as WSMessage;
                if (msg.type==="SYNC" && ignoreOwnSync.current) {
                    ignoreOwnSync.current = false;
                    return;
                }
                handleMessage(msg);
            });
        };
        client.activate();
        clientRef.current = client;
        return ()=> {
            client.deactivate();
        }
    }, [groupId, token, localUserId, handleMessage]);

    // 4) publish sync
    const requestSync = useCallback((cur: number, oth: number) => {
        if (!clientRef.current || !localUserId) return;
        ignoreOwnSync.current = true;
        const dm = Math.floor(cur/60), ds = cur%60;
        const om = Math.floor(oth/60), os = oth%60;
        clientRef.current.publish({
            destination: "/app/group.sync",
            headers:     { Authorization: token! },
            body: JSON.stringify({
                senderId:       localUserId,
                groupId,
                duration:       `PT${dm}M${ds}S`,
                secondDuration:`PT${om}M${os}S`
            })
        });
    }, [groupId, localUserId, token]);

    return { participants, timers, loading, error, requestSync };
}
