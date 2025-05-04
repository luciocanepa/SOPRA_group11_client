// hooks/useGroupParticipants.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useApi } from '@/hooks/useApi';

export interface Participant {
    id: number;
    username: string;
    status: 'ONLINE' | 'OFFLINE' | 'WORK' | 'BREAK';
}

interface GroupResponse {
    users: Participant[];
}

// Export TimerInfo so it can be imported by components
export interface TimerInfo {
    start: Date;
    duration: number; // in seconds
    running: boolean;
}

type TimerUpdateMsg = {
    type: 'TIMER_UPDATE';
    userId: string;
    status: Participant['status'];
    duration: string;   // ISO8601, e.g. "PT25M55S"
    startTime: string;  // ISO timestamp
};

type StatusMsg = {
    type: 'STATUS';
    userId: string;
    status: Participant['status'];
};

type WSMessage = TimerUpdateMsg | StatusMsg;

export function useGroupParticipants(groupId: string, token: string | null) {
    const api = useApi();
    const clientRef = useRef<Client | null>(null);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [timers, setTimers] = useState<Record<number, TimerInfo>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1) Initial fetch
    useEffect(() => {
        if (!token) return;
        setLoading(true);
        api.get<GroupResponse>(`/groups/${groupId}`, token)
            .then(res => {
                setParticipants(res.users);
                setError(null);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load participants');
            })
            .finally(() => setLoading(false));
    }, [groupId, token, api]);

    // 2) WS message handler
    const handleMessage = useCallback((msg: WSMessage) => {
        const userId = Number(msg.userId);
        if (Number.isNaN(userId)) return;

        if (msg.type === 'TIMER_UPDATE') {
            // parse ISO8601 durations PT##M##S or PT##M
            let durationSec = 0;
            const fullMatch = msg.duration.match(/^PT(\d+)M(\d+)S$/);
            if (fullMatch) {
                durationSec = parseInt(fullMatch[1], 10) * 60 + parseInt(fullMatch[2], 10);
            } else {
                const minMatch = msg.duration.match(/^PT(\d+)M$/);
                if (minMatch) {
                    durationSec = parseInt(minMatch[1], 10) * 60;
                } else {
                    durationSec = Number(msg.duration) || 0;
                }
            }

            // normalize startTime string
            const raw = msg.startTime;
            const ts = (/^[0-9\-T:.]+Z$/.test(raw) || /[+-]\d\d:\d\d$/.test(raw)) ? raw : raw + 'Z';
            const start = new Date(ts);
            // determine running: break status means paused
            const running = msg.status !== 'BREAK';

            // update participants status
            setParticipants(prev => prev.map(u => u.id === userId ? { ...u, status: msg.status } : u));

            // update timer info
            setTimers(prev => ({
                ...prev,
                [userId]: { start, duration: durationSec, running }
            }));

        } else {
            // STATUS message
            setParticipants(prev => prev.map(u => u.id === userId ? { ...u, status: msg.status } : u));
        }
    }, []);

    // 3) STOMP/SockJS connection
    useEffect(() => {
        if (!token || typeof window === 'undefined') return;

        const backend = window.location.hostname === 'localhost'
            ? 'http://localhost:8080'
            : window.location.origin;
        const sock = new SockJS(`${backend}/ws`);
        const client = new Client({
            webSocketFactory: () => sock,
            connectHeaders: { Authorization: token },
            debug: () => {},
            onStompError: frame => console.error('STOMP error:', frame.headers['message']),
        });

        client.onConnect = () => {
            client.subscribe(`/topic/group.${groupId}`, (message: IMessage) => {
                try {
                    handleMessage(JSON.parse(message.body));
                } catch (e) {
                    console.error('Invalid WS payload', e);
                }
            });
        };

        client.activate();
        clientRef.current = client;
        return () => { client.deactivate(); };
    }, [groupId, token, handleMessage]);

    return { participants, timers, loading, error };
}
