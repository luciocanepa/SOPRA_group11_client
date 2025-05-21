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

function parseIsoDuration(iso: string): number {
    const m = Number((iso.match(/PT(\d+)M/)||[])[1]||0);
    const s = Number((iso.match(/(\d+)S/)  ||[])[1]||0);
    return m*60 + s;
}

interface SyncRequest {
    senderId:       string;
    senderName:     string;
    status:         "ONLINE"|"OFFLINE"|"WORK"|"BREAK";
    startTime:      string;
    duration:       string;
    originalDuration: string;
    secondDuration: string;
}

export default function GroupPage() {
    const { gid } = useParams();
    const groupId = gid as string;
    const router  = useRouter();
    const api     = useApi();
    const { value: token }       = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");

    const [group, setGroup] = useState<Group|null>(null);
    const [user,  setUser]  = useState<User|null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [plannedSessionsOpen, setPlannedSessionsOpen] = useState(false);

    const [isRunning, setIsRunning] = useState(false);
    const [isSession, setIsSession] = useState(true);
    const isBreak = isRunning && !isSession;
    const [durations, setDurations] = useState({ session: 25 * 60, break: 5 * 60 });

    const [incomingSync, setIncomingSync] = useState<SyncRequest|null>(null);
    const [acceptedSync, setAcceptedSync] = useState<{
        status: "ONLINE"|"OFFLINE"|"WORK"|"BREAK";
        startTime:string;
        duration: number;
        originalDuration: number;
        secondDuration:number;
    }|null>(null);

    // Load group & user
    useEffect(() => {
        if (!token) return;
        api.get<Group>(`/groups/${groupId}`, token).then(setGroup).catch(console.error);
    }, [api, groupId, token]);
    useEffect(() => {
        if (!token||!localUserId) return;
        api.get<User>(`/users/${localUserId}`, token).then(setUser).catch(console.error);
    }, [api, token, localUserId]);

    const handleIncomingSync = useCallback((req: SyncRequest) => {
        if (req.senderId===localUserId) return;

        // browser notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Sync Request", {
                body: `${req.senderName} wants to sync their timer.`,
                icon: "/tomato_guy.png",
            });
        }

        setIncomingSync(req);
    }, [localUserId]);

    const { timers, loading, requestSync } = useGroupParticipants(
        groupId, token, handleIncomingSync
    );

    const handleUpdate = useCallback(async (info:{ status:"WORK"|"BREAK"|"ONLINE"|"OFFLINE"; startTime:string; duration:number; secondDuration?:number; })=>{
        if (!token||!localUserId) return;
        const m = Math.floor(info.duration/60), s=info.duration%60;
        const iso=`PT${m}M${s}S`;
        try {
            await api.put(`/users/${localUserId}/timer`,
                { status:info.status, startTime:info.startTime, duration:iso }, token);
        } catch(e){console.error(e);}
    },[api,token,localUserId]);

    const onAccept = () => {
        if (!incomingSync) return;

        const startTime = new Date(incomingSync.startTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);

        const remaining = Math.max(0, parseIsoDuration(incomingSync.duration) - elapsed);
        const original = parseIsoDuration(incomingSync.originalDuration);
        const fullOther = parseIsoDuration(incomingSync.secondDuration);

        const nowIso = new Date().toISOString();
        const durIso = `PT${Math.floor(remaining / 60)}M${remaining % 60}S`;

        api.put(`/users/${localUserId}/timer`, {
            status: incomingSync.status,
            startTime: nowIso,
            duration: durIso
        }, token).catch(console.error);

        setAcceptedSync({
            status: incomingSync.status,
            startTime: nowIso,
            duration: remaining,
            originalDuration: original,
            secondDuration: fullOther
        });

        setIncomingSync(null);
    };

    const onDecline = () => setIncomingSync(null);

    const triggerManualSync = async () => {
        const me = Number(localUserId);
        const ti = timers[me];
        if (!ti) return;

        const rem = Math.ceil((ti.start.getTime() + ti.duration * 1000 - Date.now()) / 1000);

        const nowIso = new Date().toISOString();
        const isoDur = `PT${Math.floor(rem / 60)}M${rem % 60}S`;

        try {
            // Update the user's timer in the backend first
            await api.put(`/users/${localUserId}/timer`, {
                status: isSession ? "WORK" : "BREAK",
                startTime: nowIso,
                duration: isoDur
            }, token);

            // Then notify others via WebSocket
            const current = isSession ? durations.session : durations.break;
            const other   = isSession ? durations.break   : durations.session;

            requestSync(rem, current, other);

            // ❌ Do NOT setAcceptedSync for the sender anymore
            // Sender already has timer running — avoid resyncing self
        } catch (err) {
            console.error("Sync failed", err);
        }
    };


    useEffect(()=>{
        if (!acceptedSync) return;
        const id = setTimeout(()=>setAcceptedSync(null),0);
        return ()=>clearTimeout(id);
    },[acceptedSync]);

    return (
        <div className="page-container">
            <Navbar user={user}/>
            <div className="group-dashboard">
                <div className="group-participants-list">
                    <GroupParticipants groupId={groupId} adminId={group?.adminId}/>
                </div>
                <div className="timer-column" style={{
                    flex:2, display:"flex",justifyContent:"center",alignItems:"center"
                }}>
                    <PomodoroTimer
                        onTimerStatusChange={r=>setIsRunning(r)}
                        onSessionStatusChange={s=>setIsSession(s)}
                        onTimerUpdate={handleUpdate}
                        onActiveDurationsChange={setDurations}
                        fullscreen={false}
                        externalSync={acceptedSync||undefined}
                        user={user}
                        timers={timers}
                    />
                </div>
                <div className="group-dashboard-button-container">
                    <Button className="secondary"
                            onClick={()=>{ setInviteOpen(v=>!v); setCalendarOpen(false); setPlannedSessionsOpen(false); }}>
                        {inviteOpen? "-" : "+"} Invite Users
                    </Button>
                    {inviteOpen && <InviteUser group={group} isVisible={inviteOpen}/>}
                    <Button className="secondary"
                            onClick={()=>{ setCalendarOpen(v=>!v); setInviteOpen(false); setPlannedSessionsOpen(false); }}>
                        {calendarOpen? "-" : "+"} Plan Session
                    </Button>
                    {calendarOpen && (
                        <CalendarAPI
                            isOpen={calendarOpen}
                            onClose={()=>setCalendarOpen(false)}
                            groupName={group?.name||"Unnamed Group"}
                            userTimezone={user?.timezone||"Europe/Zurich"}
                            userId={user?.id||""}
                            groupId={group?.id||0}
                        />
                    )}
                    <Button className="secondary"
                            onClick={()=>{ setPlannedSessionsOpen(v=>!v); setCalendarOpen(false); setInviteOpen(false); }}>
                        {plannedSessionsOpen? "-" : "+"} View Upcoming Study Sessions
                    </Button>
                    {plannedSessionsOpen && (
                        <ScheduledSessions
                            isOpen={plannedSessionsOpen}
                            groupId={groupId}
                            userTimezone={user?.timezone||"Europe/Zurich"}
                        />
                    )}
                    <Button className="secondary"
                            disabled={!isRunning||loading}
                            onClick={triggerManualSync}
                    >Sync Timer</Button>
                    {token&&localUserId&&group?.adminId===Number(localUserId)&&(
                        <Button className="secondary"
                                onClick={()=>router.push(`/groups/${groupId}/edit`)}>
                            Manage Group ↗
                        </Button>
                    )}
                </div>
            </div>
            <Modal
                open={!!incomingSync}
                title="Sync Timer?"
                okText="Accept"
                cancelText="Decline"
                onOk={onAccept}
                onCancel={onDecline}
            >
                <p>
                    <strong>{incomingSync?.senderName}</strong> wants to sync their timer. Accept?
                </p>
            </Modal>
            <div className={`group-chat-section ${isRunning&&!isBreak?"hidden":""}`}>
                {loading
                    ? <p>Loading chat…</p>
                    : user&&localUserId
                        ? <ChatBox groupId={groupId} userId={localUserId}/>
                        : <p>Please log in to access chat</p>
                }
            </div>
        </div>
    );
}
