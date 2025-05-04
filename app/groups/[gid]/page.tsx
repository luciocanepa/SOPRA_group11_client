"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Modal, Card } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { InviteUser } from "@/components/InviteUser";
import "@/styles/pages/login.css";
import Navbar from "@/components/Navbar";

export default function GroupPage() {
    const { gid } = useParams();
    const groupId = gid as string;
    const api = useApi();
    const router = useRouter();
    const { value: token } = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");

    const [group, setGroup] = useState<Group | null>(null);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteKey, setInviteKey] = useState(0);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!token || !localUserId) return;
        api.get<Group>(`/groups/${groupId}`, token)
            .then((data) => setGroup(data))
            .catch(console.error);
    }, [groupId, token, localUserId, api]);

    const handleStatus = useCallback((running: boolean) => {
        setIsRunning(running);
    }, []);

    const handleUpdate = useCallback(
        async ({ status, startTime, duration }: { status: string; startTime: string; duration: number }) => {
            if (!token || !localUserId) return;
            // include seconds in ISO:PTmMsS
            const mins = Math.floor(duration / 60);
            const secs = duration % 60;
            const isoDur = `PT${mins}M${secs}S`;
            try {
                await api.put(
                    `/users/${localUserId}/timer`,
                    { status, startTime, duration: isoDur },
                    token
                );
            } catch (e) {
                console.error("Timer update failed", e);
            }
        },
        [api, token, localUserId]
    );

    return (
        <div className="main-container">
            <Navbar user={null} group={group} />
            <div className="main-content" style={{ display: "flex", gap: "2rem" }}>
                <div className="timer-column" style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <PomodoroTimer
                        onTimerStatusChange={handleStatus}
                        onTimerUpdate={handleUpdate}
                    />
                </div>

                <div
                    className="left-column"
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        marginTop: "1rem",
                    }}
                >
                    <button className="stop" onClick={() => setInviteOpen(true)}>
                        + Invite Users
                    </button>

                    <button className="start" onClick={() => setCalendarOpen(true)}>
                        + Plan Session
                    </button>

                    {token && localUserId && group?.adminId === parseInt(localUserId) && (
                        <button
                            className="reset"
                            onClick={() => router.push(`/edit/group/${groupId}`)}
                        >
                            ⚙️ Manage Group
                        </button>
                    )}

                    <div className="group-participants-list">
                        <GroupParticipants groupId={groupId} adminId={group?.adminId} />
                    </div>

                    <button className="stop" onClick={() => router.push("/dashboard")}>Back to Dashboard</button>
                </div>
            </div>

            {!isRunning && (
                <div className="chat-section" style={{ marginTop: "2rem" }}>
                    <Card title="Group Chat (Break)" className="groupPage-card">
                        <p>💬 Chat feature coming soon!</p>
                    </Card>
                </div>
            )}

            <Modal
                open={inviteOpen}
                title="Invite User"
                onCancel={() => {
                    setInviteOpen(false);
                    setInviteKey((k) => k + 1);
                }}
                footer={null}
                className="groupPage-modal"
            >
                <InviteUser key={inviteKey} groupId={groupId} isVisible={inviteOpen} />
            </Modal>

            <Modal
                open={calendarOpen}
                title="Plan Study Session"
                onCancel={() => setCalendarOpen(false)}
                footer={null}
                className="groupPage-modal"
            >
                <p>📅 Google Calendar integration coming soon!</p>
            </Modal>
        </div>
    );
}
