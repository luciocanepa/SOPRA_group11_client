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

interface TimerInfo {
    start: Date;
    duration: number; // in seconds
}

// Discriminated union for incoming WS messages:
type TimerUpdateMsg = {
    type: 'TIMER_UPDATE';
    userId: string;       // always present as string
    username: string;     // only on TIMER_UPDATE
    status: Participant['status'];
    duration: string;     // only on TIMER_UPDATE
    startTime: string;    // only on TIMER_UPDATE
};
type StatusMsg = {
    type: 'STATUS';
    userId: string;
    status: Participant['status'];
};
type WSMessage = TimerUpdateMsg | StatusMsg;

export function useGroupParticipants(
    groupId: string,
    token: string | null
) {
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

    // 2) Handle incoming WS messages
    const handleMessage = useCallback((msg: WSMessage) => {
        const userId = Number(msg.userId);
        if (Number.isNaN(userId)) {
            console.warn('WS: invalid userId:', msg.userId);
            return;
        }

        if (msg.type === 'TIMER_UPDATE') {
            // update status
            setParticipants(prev =>
                prev.map(u =>
                    u.id === userId ? { ...u, status: msg.status } : u
                )
            );
            // update timer
            setTimers(prev => ({
                ...prev,
                [userId]: {
                    start: new Date(msg.startTime),
                    duration: Number(msg.duration),
                },
            }));
        } else /* msg.type === 'STATUS' */ {
            setParticipants(prev =>
                prev.map(u =>
                    u.id === userId ? { ...u, status: msg.status } : u
                )
            );
        }
    }, []);

    // 3) STOMP / SockJS setup
    useEffect(() => {
        if (!token || typeof window === 'undefined') return;

        // Determine backend host for WebSocket
        // Use localhost:8080 in dev, same origin in prod
        const backendHost =
            window.location.hostname === 'localhost'
                ? 'http://localhost:8080'
                : window.location.origin;

        // Point SockJS at the Spring Boot /ws endpoint
        const sock = new SockJS(`${backendHost}/ws`);
        const client = new Client({
            webSocketFactory: () => sock,
            connectHeaders: { Authorization: token },
            debug: () => {},
            onStompError: frame => {
                console.error('STOMP error:', frame.headers['message']);
            },
        });

        // now `client` exists, so we can refer to it
        client.onConnect = () => {
            console.log('STOMP connected to', `${backendHost}/ws`);
            client.subscribe(`/topic/group.${groupId}`, (message: IMessage) => {
                console.log('[WS RAW]', message.body);
                try {
                    const data = JSON.parse(message.body) as WSMessage;
                    console.log('[WS PARSED]', data);
                    handleMessage(data);
                } catch (e) {
                    console.error('Invalid WS message', e);
                }
            });
        };

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [groupId, token, handleMessage]);

    return { participants, timers, loading, error };
}
