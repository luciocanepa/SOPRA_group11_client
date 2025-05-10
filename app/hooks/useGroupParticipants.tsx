// hooks/useGroupParticipants.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Client, IMessage }            from "@stomp/stompjs";
import SockJS                          from "sockjs-client";
import { useApi }                      from "@/hooks/useApi";

export interface Participant {
    id:       number;
    username: string;
    status:   "ONLINE" | "OFFLINE" | "WORK" | "BREAK";
}

export interface TimerInfo {
    start:    Date;
    duration: number;  // seconds
    running:  boolean;
}

interface GroupUserDTO {
    id:        number;
    username:  string;
    status:    "ONLINE" | "OFFLINE" | "WORK" | "BREAK";
}

interface GroupResponse {
    users: GroupUserDTO[];
}

type TimerUpdateMsg = {
    type:      "TIMER_UPDATE" | "SYNC";
    userId:    string;
    status:    Participant["status"];
    startTime: string;   // ISO string
    duration:  string;   // ISO8601 “PT##M##S”
};

type StatusMsg = {
    type:   "STATUS";
    userId: string;
    status: Participant["status"];
};

type WSMessage = TimerUpdateMsg | StatusMsg;

export function useGroupParticipants(
    groupId: string,
    token:   string | null
) {
    const api       = useApi();
    const clientRef = useRef<Client|null>(null);
    const [connected, setConnected] = useState(false);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [timers,       setTimers]       = useState<Record<number,TimerInfo>>({});
    const [loading,      setLoading]      = useState(true);
    const [error,        setError]        = useState<string|null>(null);

    // helper to turn PT##M##S → seconds
    function parseIso(iso: string): number {
        const m = Number((iso.match(/PT(\d+)M/) || [])[1] || 0);
        const s = Number((iso.match(/(\d+)S/)   || [])[1] || 0);
        return m*60 + s;
    }

    // 1) initial REST → participants list
    useEffect(() => {
        if (!token) return;
        setLoading(true);

        api.get<GroupResponse>(`/groups/${groupId}`, token)
            .then(res => {
                setParticipants(res.users.map(u => ({
                    id:       u.id,
                    username: u.username,
                    status:   u.status
                })));
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError("Failed to load participants");
            })
            .finally(() => setLoading(false));
    }, [groupId, token, api]);

    // 2) WS message handler for both TIMER_UPDATE and the SYNC responses
    const handleMessage = useCallback((raw: any) => {
        const type = raw.type as string;
        // pick the right id field:
        const uid = Number(raw.userId ?? raw.senderId);
        if (isNaN(uid)) return;

        if (type === "TIMER_UPDATE" || type === "SYNC") {
            // parse PT##M##S → seconds
            const m = Number((raw.duration.match(/PT(\d+)M/)||[])[1] || 0);
            const s = Number((raw.duration.match(/(\d+)S/)   ||[])[1] || 0);
            const secs = m*60 + s;
            // normalize startTime to a real Date
            const ts = raw.startTime.endsWith("Z")
                ? raw.startTime
                : raw.startTime + "Z";
            const start = new Date(ts);
            // running only if WORK
            const running = raw.status === "WORK";

            // update both status & timers
            setParticipants(ps =>
                ps.map(u => u.id === uid ? { ...u, status: raw.status } : u)
            );
            setTimers(ts => ({
                ...ts,
                [uid]: { start, duration: secs, running }
            }));
        }
        else if (type === "STATUS") {
            setParticipants(ps =>
                ps.map(u => u.id === uid ? { ...u, status: raw.status } : u)
            );
        }
    }, []);


    // 3) Open STOMP subscription
    useEffect(() => {
        if (!token || typeof window === "undefined") return;

        const backend = window.location.hostname === "localhost"
            ? "http://localhost:8080"
            : window.location.origin;

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
                try { handleMessage(JSON.parse(m.body)); }
                catch(e) { console.error("Invalid WS payload", e); }
            });
        };

        client.activate();
        clientRef.current = client;
        return () => { client.deactivate(); };

    }, [groupId, token, handleMessage]);

    // 4) as soon as we have both a participant list and the socket is up,
    //    fire off one /app/group.sync per user who’s mid‐timer.
    // 4) fire one sync per person mid‐timer
    useEffect(() => {
        if (!clientRef.current || !connected) return;
        participants.forEach(u => {
            if (u.status === "WORK" || u.status === "BREAK") {
                clientRef.current!.publish({
                    destination: "/app/group.sync",
                    body: JSON.stringify({ senderId: u.id.toString(), groupId })
                });
            }
        });
    }, [connected, participants, groupId]);


    return { participants, timers, loading, error };
}
