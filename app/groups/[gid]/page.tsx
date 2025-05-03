"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { CalendarAPI } from "@/components/CalendarAPI";
import { Modal, Card, DatePicker, TimePicker, Form, message } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { InviteUser } from "@/components/InviteUser";
import "@/styles/pages/login.css"; // keep her unified styles



export default function GroupPage() {
  const params = useParams();
  const groupId = params.gid as string;
  const apiService = useApi();
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: localUserId } = useLocalStorage<string>("id", "");

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isGroupOwner, setIsGroupOwner] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteFormKey, setInviteFormKey] = useState(0);

  const handleTimerStatusChange = (isRunning: boolean) => {
    setIsRunning(isRunning);
  };

  const [groupData, setGroupData] = useState<Group | null>(null);
  //const [userData, setUserData] = useState<User | null>(null);
  // --> userData will probably be needed for the timezones

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!token || !localUserId) return;
      try {
        const groupData: Group = await apiService.get<Group>(
          `/groups/${groupId}`,
          token,
        );
        setGroupData(groupData)
        setIsGroupOwner(groupData.adminId === localUserId);
      } catch (error) {
        console.error("Failed to fetch group admin data", error);
      }
    };
    checkIfAdmin();

  }, [groupId, apiService, localUserId, token]);




  return (
    <div className="main-container">
      {/* Header & Timer Section */}
      <h1 className="group-title">Study Session</h1>
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

          <button className="start" onClick={() => {
            setCalendarModalOpen(true)}
            }>
            + Plan Session
          </button>

          {isGroupOwner && (
            <button
              className="reset"
              onClick={() => router.push(`/edit/group/${groupId}`)}
            >
              ⚙️ Manage Group
            </button>
          )}

          <div className="group-participants-list">
            <GroupParticipants groupId={groupId} />
          </div>

          <button className="stop" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Chat at the bottom (only on break) */}
      {!isRunning && (
        <div className="chat-section" style={{ marginTop: "2rem" }}>
          <Card title="Group Chat (Break)" className="groupPage-card">
            <p>
              💬 Chat feature coming soon! (WebSocket integration in progress)
            </p>
          </Card>
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
      {calendarModalOpen && (
        <CalendarAPI
          isOpen={calendarModalOpen}
          onClose={() => setCalendarModalOpen(false)}
          groupName={groupData?.name || "Unnamed Group"}
        />
      )}
    </div>
  );
}
