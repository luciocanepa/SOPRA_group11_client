"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Button, Modal, Card } from "antd";
import { InviteUserPlaceholder } from "@/components/InviteUserPlaceholder";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import "@/styles/pages/group_dashboard.css";

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

        console.log(
          "Local user ID:",
          localUserId,
          "Group admin ID:",
          groupData.adminId,
        );
        console.log(localUserId == groupData.adminId);

        if (groupData.adminId === localUserId) {
          setIsGroupOwner(true); // Set this if the current user is the admin
        } else {
          setIsGroupOwner(false); // Set to false if not
          console.log("User is NOT the group owner");
        }
      } catch (error) {
        console.error("Failed to fetch group admin data", error);
      }
    };
    checkIfAdmin();
  }, [groupId, apiService, localUserId, token]);

  return (
      <div className="main-container">
        {/* Back button aligned with timer top */}
        <Button
            className="groupPage-button back-button"
            onClick={() => router.push("/dashboard")}
        >
          ← Back
        </Button>

        {/* Title */}
        <h1 className="group-title">Study Session</h1>

        {/* Main content */}
        <div className="main-content">
          {/* Left column - Participants and buttons */}
          <div className="left-column">
            <GroupParticipants groupId={groupId} />

            {/* Buttons below participants but above chat */}
            <div className="button-container">
              <InviteUserPlaceholder />
              <Button
                  className="groupPage-button"
                  onClick={() => setCalendarModalOpen(true)}
              >
                + Plan Session
              </Button>
              {isGroupOwner && (
                  <Button
                      className="groupPage-button"
                      onClick={() => router.push(`/edit/group/${groupId}`)}
                  >
                    ⚙️ Manage Group
                  </Button>
              )}
            </div>
          </div>

          {/* Right column - Timer */}
          <div className="timer-column">
            <PomodoroTimer onTimerStatusChange={handleTimerStatusChange} />
          </div>

          {/* Chat section below everything */}
          {!isRunning && (
              <div className="chat-section">
                <Card title="Group Chat (Break)" className="groupPage-card">
                  <p>💬 Chat feature coming soon! (WebSocket integration in progress)</p>
                </Card>
              </div>
          )}
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
