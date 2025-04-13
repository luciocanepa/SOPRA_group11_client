"use client";

import {useParams, useRouter} from "next/navigation";
import React, { useEffect, useState } from "react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Button, Modal, Card } from "antd";
import { InviteUserPlaceholder } from "@/components/InviteUserPlaceholder";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import {Group} from "@/types/group";


export default function GroupPage() {
    const params = useParams();
    const groupId = params.gid as string;
    const apiService = useApi();
    const router = useRouter();

    const [calendarModalOpen, setCalendarModalOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false); // Timer state
    const [isGroupOwner, setIsGroupOwner] = useState(false);

    const handleTimerStatusChange = (isRunning: boolean) => {
        setIsRunning(isRunning); // Update isRunning state when the timer starts/stops
    };

    useEffect(() => {
        const checkIfAdmin = async () => {
            try {
                // Using apiService to get the group data by its ID
                const groupData: Group = await apiService.get<Group>(`/groups/${groupId}`);

                const localUserId = localStorage.getItem("id"); // Get the user ID from localStorage
                console.log("Local user ID:", localUserId, "Group admin ID:", groupData.adminId);
                console.log(localUserId == groupData.adminId);

                if (groupData.adminId === localUserId) {
                    setIsGroupOwner(true);  // Set this if the current user is the admin
                } else {
                    setIsGroupOwner(false);  // Set to false if not
                    console.log("User is NOT the group owner");
                }
            } catch (error) {
                console.error("Failed to fetch group admin data", error);
            }
        };
        checkIfAdmin();
    }, [groupId, apiService]);

    return (
        <div className="groupPage-container">
            <div className="main-content">
                {/* Timer Section */}
                <div className="timer-section">
                    <Card title="Pomodoro Timer" className="groupPage-card h-fit">
                        <PomodoroTimer onTimerStatusChange={handleTimerStatusChange} />
                    </Card>

                    {/* Conditionally render the chat based on the timer status */}
                    {!isRunning && (
                        <Card title="Group Chat (Break)" className="groupPage-card mt-6">
                            <p>💬 Chat feature coming soon! (WebSocket integration in progress)</p>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Invite, Plan, Participants */}
                <div className="side-section">
                    <div className="flex flex-col gap-4">
                        <InviteUserPlaceholder />
                        <Button
                            className="groupPage-button"
                            onClick={() => setCalendarModalOpen(true)}
                        >
                            + Plan Session
                        </Button>
                    </div>

                    <Card title="Participants" className="groupPage-card h-fit mt-4">
                        <GroupParticipants groupId={groupId} />
                    </Card>
                    {isGroupOwner && (
                        <Button
                            className="groupPage-button"
                            onClick={() => console.log("Open manage group modal")}
                        >
                            ⚙️ Manage Group
                        </Button>
                    )}
                    <Button className="groupPage-button" onClick={() => router.push("/dashboard")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>

            {/* Calendar modal */}
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
