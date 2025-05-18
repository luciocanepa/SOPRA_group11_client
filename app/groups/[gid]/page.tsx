// app/groups/[gid]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Modal, Button } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { useGroupParticipants } from "@/hooks/useGroupParticipants";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { CalendarAPI } from "@/components/CalendarAPI";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { InviteUser } from "@/components/InviteUser";
import { ChatBox } from "@/components/Chat";
import Navbar from "@/components/Navbar";
import ScheduledSessions from "@/components/ScheduledSessions";

import "@/styles/pages/GroupPage.css";

// parse PT##M##S → seconds
function parseIsoDuration(iso: string): number {
    const m = Number((iso.match(/PT(\d+)M/) || [])[1] || 0);
    const s = Number((iso.match(/(\d+)S/)  || [])[1] || 0);
    return m * 60 + s;
}

interface SyncRequest {
    senderId:       string;
    senderName:     string;
    status:         "ONLINE" | "OFFLINE" | "WORK" | "BREAK";
    startTime:      string;
    duration:       string; // PT##M##S
    secondDuration: string; // PT##M##S
}

export default function GroupPage() {
    const { gid } = useParams();
    const groupId = gid as string;
    const router  = useRouter();
    const api     = useApi();
    const { value: token }       = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");

    const [group, setGroup] = useState<Group | null>(null);
    const [user,  setUser]  = useState<User  | null>(null);

    const [inviteOpen, setInviteOpen]               = useState(false);
    const [calendarOpen, setCalendarOpen]           = useState(false);
    const [plannedSessionsOpen, setPlannedSessionsOpen] = useState(false);

    const [isRunning, setIsRunning] = useState(false);
    const [isSession, setIsSession] = useState(true);
    const isBreak = isRunning && !isSession;

    const [incomingSync, setIncomingSync] = useState<SyncRequest | null>(null);
    const [acceptedSync, setAcceptedSync] = useState<{ status: "ONLINE" | "OFFLINE" | "WORK" | "BREAK"; startTime: string; duration: number; secondDuration: number; } | null>(null);

    // 1) Load group
    useEffect(() => {
        if (!token) return;
        api.get<Group>(`/groups/${groupId}`, token)
            .then(setGroup)
            .catch(console.error);
    }, [api, groupId, token]);

    // 2) Load user
    useEffect(() => {
        if (!token || !localUserId) return;
        api.get<User>(`/users/${localUserId}`, token)
            .then(setUser)
            .catch(console.error);
    }, [api, token, localUserId]);

    // 3) WebSocket hook
    const handleIncomingSync = useCallback((req: SyncRequest) => {
        if (req.senderId === localUserId) return;
        setIncomingSync(req);
    }, [localUserId]);

    const { timers, loading, requestSync } = useGroupParticipants(groupId, token, handleIncomingSync);

    // 4) Push every update to backend; no auto WS-sync here
    const handleUpdate = useCallback(async (info: { status: "WORK"|"BREAK"|"ONLINE"|"OFFLINE"; startTime: string; duration: number; secondDuration?: number; }) => {
        if (!token || !localUserId) return;
        const mins = Math.floor(info.duration/60);
        const secs = info.duration%60;
        const iso  = `PT${mins}M${secs}S`;
        try {
            await api.put(
                `/users/${localUserId}/timer`,
                { status: info.status, startTime: info.startTime, duration: iso },
                token
            );
        } catch(e) {
            console.error("Timer update failed", e);
        }
    }, [api, token, localUserId]);

    // 5) Accept / Decline logic (subtract elapsed, then apply)
    const onAccept = () => {
        if (!incomingSync) return;
        const elapsed = Math.floor((Date.now() - new Date(incomingSync.startTime).getTime())/1000);
        const baseRem  = parseIsoDuration(incomingSync.duration);
        const otherSec = parseIsoDuration(incomingSync.secondDuration);
        const adjusted = incomingSync.status === "BREAK" ? otherSec : Math.max(0, baseRem - elapsed);
        const nowIso   = new Date().toISOString();

        api.put(
            `/users/${localUserId}/timer`,
            { status: incomingSync.status, startTime: nowIso, duration: `PT${Math.floor(adjusted/60)}M${adjusted%60}S` },
            token!
        ).catch(console.error);

        setAcceptedSync({ status: incomingSync.status, startTime: nowIso, duration: adjusted, secondDuration: otherSec });
        setIncomingSync(null);
    };
    const onDecline = () => setIncomingSync(null);

    // 6) Manual Sync button remains
    const triggerManualSync = () => {
        const me = Number(localUserId);
        const ti = timers[me];
        const rem = ti ? Math.ceil((ti.start.getTime()+ti.duration*1000 - Date.now())/1000) : 0;
        requestSync(rem, rem);
        setAcceptedSync({ status: isSession ? "WORK" : "BREAK", startTime: new Date().toISOString(), duration: rem, secondDuration: rem });
    };

    // 7) Reset acceptedSync flag
    useEffect(() => {
        if (!acceptedSync) return;
        const id = setTimeout(() => setAcceptedSync(null), 0);
        return () => clearTimeout(id);
    }, [acceptedSync]);

    return (
        <div className="page-container">
            <Navbar user={user} />

            <div className="group-dashboard">
                <div className="group-participants-list">
                    <GroupParticipants groupId={groupId} adminId={group?.adminId}/>
                </div>

                <div className="timer-column" style={{ flex:2, display:"flex", justifyContent:"center", alignItems:"center" }}>
                    <PomodoroTimer onTimerStatusChange={r => setIsRunning(r)} onSessionStatusChange={s => setIsSession(s)} onTimerUpdate={handleUpdate} fullscreen={false} externalSync={acceptedSync ?? undefined} />
                </div>

                <div className="group-dashboard-button-container">
                    <Button className="secondary" onClick={() => { setInviteOpen(v => !v); setCalendarOpen(false); setPlannedSessionsOpen(false); }}>{inviteOpen ? "-" : "+"} Invite Users</Button>
                    {inviteOpen && <InviteUser group={group} isVisible={inviteOpen}/>}

                    <Button className="secondary" onClick={() => { setCalendarOpen(v => !v); setInviteOpen(false); setPlannedSessionsOpen(false); }}>{calendarOpen ? "-" : "+"} Plan Session</Button>
                    {calendarOpen && (<CalendarAPI isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} groupName={group?.name || "Unnamed Group"} userTimezone={user?.timezone || "Europe/Zurich"} userId={user?.id || ""} groupId={group?.id  || 0} />)}

                    <Button className="secondary" onClick={() => { setPlannedSessionsOpen(v => !v); setCalendarOpen(false); setInviteOpen(false); }}>{plannedSessionsOpen ? "-" : "+"} View Upcoming Study Sessions</Button>
                    {plannedSessionsOpen && (<ScheduledSessions isOpen={plannedSessionsOpen} groupId={groupId} userTimezone={user?.timezone || "Europe/Zurich"} />)}

                    <Button className="secondary" onClick={triggerManualSync} disabled={!isRunning||loading}>Sync Timer</Button>

                    {token && localUserId && group?.adminId === Number(localUserId) && (<Button className="secondary" onClick={() => router.push(`/groups/${groupId}/edit`)}>Manage Group ↗</Button>)}
                </div>
            </div>

            <Modal open={!!incomingSync} title="Sync Timer?" okText="Accept" cancelText="Decline" onOk={onAccept} onCancel={onDecline}>
                <p><strong>{incomingSync?.senderName}</strong> wants to sync their timer. Accept?</p>
            </Modal>

            <div className={`group-chat-section ${isRunning && !isBreak ? "hidden" : ""}`}>{loading ? <p>Loading chat…</p> : user && localUserId ? <ChatBox groupId={groupId} userId={localUserId}/> : <p>Please log in to access chat</p>}</div>
        </div>
    );
}