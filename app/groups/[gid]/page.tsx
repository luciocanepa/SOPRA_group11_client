// pages/GroupPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Modal, Button } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { useGroupParticipants } from "@/hooks/useGroupParticipants";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { InviteUser } from "@/components/InviteUser";
import { ChatBox } from "@/components/Chat";
import Navbar from "@/components/Navbar";
import { Group } from "@/types/group";

import "@/styles/pages/GroupPage.css";

interface SyncRequest {
    senderId:  string;
    senderName: string;
    status:    "ONLINE" | "OFFLINE" | "WORK" | "BREAK";
    startTime: string; // when WE received the SYNC
    duration:  string; // PT##M##S at send-time
}

export default function GroupPage() {
    const { gid } = useParams();
    const groupId = gid as string;
    const router  = useRouter();
    const api     = useApi();
    const { value: token }       = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");

    const [group,        setGroup]        = useState<Group|null>(null);
    const [inviteOpen,   setInviteOpen]   = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    const [isRunning,   setIsRunning]   = useState(false);
    const [isSession,   setIsSession]   = useState(true);
    const isBreak = isRunning && !isSession;
    const [username,    setUsername]    = useState("");
    const [loadingUser, setLoadingUser] = useState(true);

    const [incomingSync, setIncomingSync] = useState<SyncRequest|null>(null);
    const [acceptedSync, setAcceptedSync] = useState<{
        status:    "ONLINE"|"OFFLINE"|"WORK"|"BREAK";
        startTime: string;
        duration:  number;
    }|null>(null);

    const handleIncomingSync = (req: SyncRequest) => {
        if (req.senderId === localUserId) return;
        setIncomingSync(req);
    };

    useEffect(() => {
        if (!token) return;
        api.get<Group>(`/groups/${groupId}`, token)
            .then(g => setGroup(g))
            .catch(console.error);
    }, [api, groupId, token]);

    useEffect(() => {
        if (!token || !localUserId) {
            setLoadingUser(false);
            return;
        }
        api.get<{username:string}>(`/users/${localUserId}`, token)
            .then(u => setUsername(u.username))
            .catch(console.error)
            .finally(() => setLoadingUser(false));
    }, [api, token, localUserId]);

    const handleUpdate = useCallback(async ({
                                                status, startTime, duration
                                            }: { status:string; startTime:string; duration:number }) => {
        if (!token || !localUserId) return;
        const m = Math.floor(duration/60), s = duration%60;
        const iso = `PT${m}M${s}S`;
        try {
            await api.put(
                `/users/${localUserId}/timer`,
                { status, startTime, duration: iso },
                token
            );
        } catch(e) {
            console.error("Timer update failed", e);
        }
    }, [api, token, localUserId]);

    const { loading, requestSync } =
        useGroupParticipants(groupId, token, handleIncomingSync);

    const onAccept = () => {
        if (!incomingSync) return;

        // how many seconds have passed since we got it?
        const elapsed = Math.floor(
            (Date.now() - new Date(incomingSync.startTime).getTime())/1000
        );

        // parse original remaining
        const [, m, s] = incomingSync.duration.match(/PT(\d+)M(\d+)S/)!;
        const originalRem = Number(m)*60 + Number(s);

        const adjustedRem = Math.max(0, originalRem - elapsed);
        const nowIso      = new Date().toISOString();

        handleUpdate({
            status:    incomingSync.status,
            startTime: nowIso,
            duration:  adjustedRem
        });

        setAcceptedSync({
            status:    incomingSync.status,
            startTime: nowIso,
            duration:  adjustedRem
        });
        setIncomingSync(null);
        setTimeout(() => setAcceptedSync(null), 0);
    };

    const onDecline = () => setIncomingSync(null);

    return (
        <div className="page-container">
            <Navbar user={null} />

            <div className="group-dashboard">
                <div className="group-participants-list">
                    <GroupParticipants
                        groupId={groupId}
                        adminId={group?.adminId}
                    />
                </div>

                <div
                    className="timer-column"
                    style={{
                        flex: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <PomodoroTimer
                        onTimerStatusChange={r => setIsRunning(r)}
                        onSessionStatusChange={s => setIsSession(s)}
                        onTimerUpdate={handleUpdate}
                        fullscreen={false}
                        externalSync={acceptedSync ?? undefined}
                    />
                </div>

                <div className="group-dashboard-button-container">
                    <Button
                        className="secondary"
                        onClick={() => { setInviteOpen(!inviteOpen); setCalendarOpen(false); }}
                    >
                        {inviteOpen ? "-" : "+"} Invite Users
                    </Button>
                    {inviteOpen && <InviteUser group={group} isVisible={inviteOpen} />}

                    <Button
                        className="secondary"
                        onClick={() => { setCalendarOpen(!calendarOpen); setInviteOpen(false); }}
                    >
                        {calendarOpen ? "-" : "+"} Plan Session
                    </Button>

                    <Button
                        className="secondary"
                        onClick={requestSync}
                        disabled={!isRunning || loading}
                    >
                        Sync Timer
                    </Button>

                    {calendarOpen && (
                        <div className="group-dashboard-actions-container">
                            <p>📅 Google Calendar integration coming soon!</p>
                        </div>
                    )}

                    {token && localUserId && group?.adminId === parseInt(localUserId) && (
                        <Button
                            className="secondary"
                            onClick={() => router.push(`/groups/${groupId}/edit`)}
                        >
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
                    <strong>{incomingSync?.senderName}</strong> would like to sync their timer with you. Accept?
                </p>
            </Modal>

            <div className={`group-chat-section ${isRunning && !isBreak ? "hidden" : ""}`}>
                {loadingUser
                    ? <p>Loading chat…</p>
                    : username && localUserId
                        ? <ChatBox groupId={groupId} userId={localUserId} />
                        : <p>Please log in to access the chat</p>}
            </div>
        </div>
    );
}
