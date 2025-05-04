"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Modal, Card } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { InviteUser } from "@/components/InviteUser";
import "@/styles/pages/login.css";
import Navbar from "@/components/Navbar";
import { ChatBox } from "@/components/Chat";


interface User {
    id: string;
    username: string;
}

export default function GroupPage() {
    const params = useParams();
    const groupId = params.gid as string;
    const apiService = useApi();
    const router = useRouter();
    const { value: token } = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");

    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [group, setGroup] = useState<Group | null>(null);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteFormKey, setInviteFormKey] = useState(0);
    const [username, setUsername] = useState<string>("");
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    const handleTimerStatusChange = (isRunning: boolean) => {
        setIsRunning(isRunning);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token || !localUserId) {
                setIsLoadingUser(false);
                return;
            }

            try {
                const userData = await apiService.get<User>(`/users/${localUserId}`, token);
                setUsername(userData.username);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            } finally {
                setIsLoadingUser(false);
            }
        };

        fetchUserData();
    }, [token, localUserId, apiService]);

    useEffect(() => {
        const fetchGroup = async () => {
            if (!token || !localUserId) return;
            try {
                const groupData: Group = await apiService.get<Group>(
                    `/groups/${groupId}`,
                    token,
                );
                setGroup(groupData);
            } catch (error) {
                console.error("Failed to fetch group admin data", error);
            }
        };
        fetchGroup();
    }, [groupId, apiService, localUserId, token]);

    return (
        <div className="main-container">
            <Navbar user={null} group={group} />
            <div className="main-content" style={{ display: "flex", gap: "2rem" }}>
                {/* Left: Timer */}
                <div className="timer-column" style={{ flex: 2 }}>
                    <PomodoroTimer onTimerStatusChange={handleTimerStatusChange} />
                </div>

                {/* Right: Side Section */}
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
                    <button className="stop" onClick={() => setInviteModalOpen(true)}>
                        + Invite Users
                    </button>

                    <button className="start" onClick={() => setCalendarModalOpen(true)}>
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

                    <button className="stop" onClick={() => router.push("/dashboard")}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Chat at the bottom (only on break) */}
            {!isRunning && (
                <div className="chat-section" style={{ marginTop: "2rem" }}>
                    <div className="chat-header" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                        Group Chat
                    </div>
                    {isLoadingUser ? (
                        <p>Loading chat...</p>
                    ) : username && localUserId ? (
                        <ChatBox
                            groupId={groupId}
                            userId={localUserId}
                            username={username}
                        />
                    ) : (
                        <p>Please log in to access the chat</p>
                    )}
                </div>
            )}


            {/* Invite Modal */}
            <Modal
                open={inviteModalOpen}
                title="Invite User"
                onCancel={() => {
                    setInviteModalOpen(false);
                    setInviteFormKey((prev) => prev + 1);
                }}
                footer={null}
                className="groupPage-modal"
            >
                <InviteUser
                    key={inviteFormKey}
                    groupId={groupId}
                    isVisible={inviteModalOpen}
                />
            </Modal>

            {/* Calendar Modal */}
            <Modal
                open={calendarModalOpen}
                title="Plan Study Session"
                onCancel={() => setCalendarModalOpen(false)}
                footer={null}
                className="groupPage-modal"
            >
                <p>📅 Google Calendar integration coming soon!</p>
            </Modal>
        </div>
    );
}