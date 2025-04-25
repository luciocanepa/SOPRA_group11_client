"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Button, Modal, Card } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { InviteUser } from "@/components/InviteUser";
// import "@/styles/pages/group_dashboard.css";
import "@/styles/pages/login.css";

export default function GroupPage() {
  const params = useParams();
  const groupId = params.gid as string;
  const apiService = useApi();
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: localUserId } = useLocalStorage<string>("id", "");

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false); // Timer state
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false); // New state to control the invite user modal
  const [inviteFormKey, setInviteFormKey] = useState(0);

  const handleTimerStatusChange = (isRunning: boolean) => {
    setIsRunning(isRunning); // Update isRunning state when the timer starts/stops
  };

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!token || !localUserId) return;
      try {
        // Using apiService to get the group data by its ID
        const groupData: Group = await apiService.get<Group>(
            `/groups/${groupId}`,
            token,
        );

        if (groupData.adminId === localUserId) {
          setIsGroupOwner(true); // Set this if the current user is the admin
        } else {
          setIsGroupOwner(false); // Set to false if not
        }
      } catch (error) {
        console.error("Failed to fetch group admin data", error);
      }
    };
    checkIfAdmin();
  }, [groupId, apiService, localUserId, token]);

  return (
      <div className="main-container">
        {/* Back button */}
        <Button
            className="groupPage-button login-button"
            onClick={() => router.push("/dashboard")}
        >
          Back
        </Button>

        {/* Title */}
        <h1 className="group-title">Study Session</h1>

        {/* Main content */}
        <div className="main-content">
          {/* Participants */}
          <div className="left-column">
            <GroupParticipants groupId={groupId} />

            {/* Buttons */}
            <div className="button-container">
              <InviteUser groupId={groupId} isVisible={inviteModalOpen} />
              <Button
                  className="plan-session-button"
                  onClick={() => setCalendarModalOpen(true)}
              >
                + Plan Session
              </Button>
              {isGroupOwner && (
                  <Button
                      className="manage-group-button"
                      onClick={() => router.push(`/edit/group/${groupId}`)}
                  >
                    ⚙️ Manage Group
                  </Button>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="timer-column">
            <PomodoroTimer onTimerStatusChange={handleTimerStatusChange} />
          </div>

          {/* Chat */}
          {!isRunning && (
              <div className="chat-section">
                <Card title="Group Chat (Break)" className="groupPage-card">
                  <p>💬 Chat feature coming soon! (WebSocket integration in progress)</p>
                </Card>
              </div>
          )}
        </div>

        {/* Calendar */}
        <Modal
            open={calendarModalOpen}
            title="Plan Study Session"
            onCancel={() => setCalendarModalOpen(false)}
            footer={null}
            className="groupPage-modal"
        >
          <p>📅 Google Calendar integration coming soon!</p>
        </Modal>

        {/* Invite User */}
        <Modal
            open={inviteModalOpen}
            title="Invite User"
            onCancel={() => {
              setInviteModalOpen(false);
              setInviteFormKey(prev => prev + 1);
            }}
            footer={null}
            className="groupPage-modal"
        >
          <InviteUser key={inviteFormKey} groupId={groupId} isVisible={inviteModalOpen} />
        </Modal>
      </div>
  );
}
