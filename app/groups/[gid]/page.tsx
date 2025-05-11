"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Button } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { InviteUser } from "@/components/InviteUser";
import Navbar from "@/components/Navbar";
import { ChatBox } from "@/components/Chat";

import "@/styles/pages/GroupPage.css";

interface User {
  id: string;
  username: string;
}

export default function GroupPage() {
  const { gid } = useParams();
  const groupId = gid as string;
  const api = useApi();
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: localUserId } = useLocalStorage<string>("id", "");

  const [group, setGroup] = useState<Group | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // For chat
  const [username, setUsername] = useState<string>("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const handleStatus = useCallback((running: boolean) => {
    setIsRunning(running);
  }, []);

  const handleUpdate = useCallback(
    async ({
      status,
      startTime,
      duration,
    }: {
      status: string;
      startTime: string;
      duration: number;
    }) => {
      if (!token || !localUserId) return;
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const isoDur = `PT${mins}M${secs}S`;
      try {
        await api.put(
          `/users/${localUserId}/timer`,
          { status, startTime, duration: isoDur },
          token,
        );
      } catch (e) {
        console.error("Timer update failed", e);
      }
    },
    [api, token, localUserId],
  );

  useEffect(() => {
    if (!token || !localUserId) return;
    api
      .get<Group>(`/groups/${groupId}`, token)
      .then((data) => setGroup(data))
      .catch(console.error);
  }, [groupId, token, localUserId, api]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !localUserId) {
        setIsLoadingUser(false);
        return;
      }

      try {
        const userData = await api.get<User>(`/users/${localUserId}`, token);
        setUsername(userData.username);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserData();
  }, [token, localUserId, api]);

  return (
    <div className="page-container">
      <Navbar user={null} />

      <div className="group-dashboard">
        <div className="group-participants-list">
          <GroupParticipants groupId={groupId} adminId={group?.adminId} />
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
            onTimerStatusChange={handleStatus}
            onTimerUpdate={handleUpdate}
            fullscreen={false}
          />
        </div>

        <div className="group-dashboard-button-container">
          <Button
            className="secondary"
            onClick={() => {
              setInviteOpen(!inviteOpen);
              setCalendarOpen(false);
            }}
          >
            {inviteOpen ? "-" : "+"} Invite Users
          </Button>
          {inviteOpen && <InviteUser group={group} isVisible={inviteOpen} />}

          <Button
            className="secondary"
            onClick={() => {
              setCalendarOpen(!calendarOpen);
              setInviteOpen(false);
            }}
          >
            {calendarOpen ? "-" : "+"} Plan Session
          </Button>

          {calendarOpen && (
            <div className="group-dashboard-actions-container">
              <p>📅 Google Calendar integration coming soon!</p>
            </div>
          )}

          {token && localUserId && group?.adminId === parseInt(localUserId) && (
            <Button
              className="secondary"
              onClick={() => router.push(`/edit/group/${groupId}`)}
            >
              Manage Group ↗
            </Button>
          )}
        </div>
      </div>
      {!isRunning && (
        <div className="group-chat-section">
          {isLoadingUser ? (
            <p>Loading chat...</p>
          ) : username && localUserId ? (
            <ChatBox groupId={groupId} userId={localUserId} />
          ) : (
            <p>Please log in to access the chat</p>
          )}
        </div>
      )}
    </div>
  );
}
