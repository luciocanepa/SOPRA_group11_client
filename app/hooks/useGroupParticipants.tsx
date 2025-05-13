// hooks/useGroupParticipants.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useApi } from "@/hooks/useApi";
import { getApiDomain } from "@/utils/domain";

export interface Participant {
    id: number;
    username: string;
    status: "ONLINE" | "OFFLINE" | "WORK" | "BREAK";
}

export interface TimerInfo {
    start: Date;
    duration: number;   // seconds
    running: boolean;
}

interface GroupUserDTO {
    id: number;
    username: string;
    status: Participant["status"];
    startTime: string;  // ISO string from backend
    duration: string;   // ISO8601 "PT##M##S"
}

interface GroupResponse {
    users: GroupUserDTO[];
}

type TimerUpdateMsg = {
    type: "TIMER_UPDATE" | "SYNC";
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

type WSMessage = TimerUpdateMsg | StatusMsg;

export function useGroupParticipants(
    groupId: string,
    token: string | null
) {
    const api = useApi();
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = useState(false);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [timers, setTimers] = useState<Record<number, TimerInfo>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ─── helper to turn PT##M##S → seconds ───────────────────────
    function parseIso(iso: string): number {
        const m = Number((iso.match(/PT(\d+)M/) || [])[1] || 0);
        const s = Number((iso.match(/(\d+)S/)   || [])[1] || 0);
        return m * 60 + s;
    }

    // ─── 1) initial REST fetch → seed participants & timers ───────
    useEffect(() => {
        if (!token) return;
        setLoading(true);

        api.get<GroupResponse>(`/groups/${groupId}`, token)
            .then(res => {
                // 1a) participants
                setParticipants(res.users.map(u => ({
                    id:       u.id,
                    username: u.username,
                    status:   u.status
                })));

                // 1b) timers
                const initial: Record<number, TimerInfo> = {};
                res.users.forEach(u => {
                    if (u.status === "WORK" || u.status === "BREAK") {
                        const ts = u.startTime.endsWith("Z")
                            ? u.startTime
                            : u.startTime + "Z";
                        initial[u.id] = {
                            start:    new Date(ts),
                            duration: parseIso(u.duration),
                            running:  u.status === "WORK"
                        };
                    }
                });
                setTimers(initial);

                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load participants");
            })
            .finally(() => setLoading(false));
    }, [groupId, token, api]);

    // ─── 2) WS message handler ───────────────────────────────────
    const handleMessage = useCallback((msg: WSMessage) => {
        const uid = Number(msg.userId);
        if (isNaN(uid)) return;

        if (msg.type === "TIMER_UPDATE" || msg.type === "SYNC") {
            const secs = parseIso(msg.duration);
            const ts   = msg.startTime.endsWith("Z")
                ? msg.startTime
                : msg.startTime + "Z";
            const start   = new Date(ts);
            const running = msg.status === "WORK" || msg.status === "BREAK" ;

            setParticipants(ps =>
                ps.map(u => u.id === uid ? { ...u, status: msg.status } : u)
            );
            setTimers(ts =>
                ({ ...ts, [uid]: { start, duration: secs, running } })
            );
        } else {
            // plain STATUS
            setParticipants(ps =>
                ps.map(u => u.id === uid ? { ...u, status: msg.status } : u)
            );
        }
    }, []);

    // ─── 3) STOMP/SockJS connection ──────────────────────────────
    useEffect(() => {
        if (!token || typeof window === "undefined") return;

        const backend = getApiDomain();

        const sock   = new SockJS(`${backend}/ws`);
        const client = new Client({
            webSocketFactory: () => sock,
            connectHeaders:  { Authorization: token },
            debug:           () => {},
            onStompError:    frame => console.error("STOMP error:", frame.headers["message"]),
        });

        client.onConnect = () => {
            setConnected(true);
            client.subscribe(`/topic/group.${groupId}`, (m: IMessage) => {
                try {
                    handleMessage(JSON.parse(m.body) as WSMessage);
                } catch (e) {
                    console.error("Invalid WS payload", e);
                }
            });
        };

        client.activate();
        clientRef.current = client;
        return () => { client.deactivate(); };
    }, [groupId, token, handleMessage]);

    // ─── 4) fire SYNC for anyone already mid-timer ───────────────
    useEffect(() => {
        if (!clientRef.current || !connected) return;

        participants.forEach(u => {
            if (u.status === "WORK" || u.status === "BREAK") {
                clientRef.current!.publish({
                    destination: "/app/group.sync",
                    body: JSON.stringify({
                        senderId: u.id.toString(),
                        groupId
                    })
                });
            }
        });
    }, [connected, participants, groupId]);

    return { participants, timers, loading, error };
}