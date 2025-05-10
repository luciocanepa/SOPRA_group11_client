"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { CalendarAPI } from "@/components/CalendarAPI";
import { Modal, Card } from "antd";
import { Button } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
//import { User } from "@/types/user";
import { InviteUser } from "@/components/InviteUser";
import Navbar from "@/components/Navbar";
import { ChatBox } from "@/components/Chat";

import "@/styles/pages/GroupPage.css";

interface User {
  id: string;
  username: string;
  timezone: string
}



export default function GroupPage() {
  const { gid } = useParams();
  const groupId = gid as string;
  const api = useApi();
  const router = useRouter();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: localUserId } = useLocalStorage<string>("id", "");

  const [group, setGroup] = useState<Group | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isGroupOwner, setIsGroupOwner] = useState(false);

  // For chat
  const [username, setUsername] = useState<string>("");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  //const [groupData, setGroupData] = useState<Group | null>(null);
  //const [userData, setUserData] = useState<User | null>(null);



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
    const checkIfAdmin = async () => {
      if (!token || !localUserId) return;
      try {
        const groupData: Group = await api.get<Group>(
          `/groups/${groupId}`,
          token,
        );
        const user: User = await api.get<User>(`/users/${localUserId}`, token)
        setGroup(group)
        setIsGroupOwner(group?.adminId === localUserId);
        setUser(user);
      } catch (error) {
        console.error("Failed to fetch group admin data", error);
      }
    };
    checkIfAdmin();

  }, [groupId, api, localUserId, token]);



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
  }, [token, localUserId, api, groupId]);




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

          <button className="start" onClick={() => {
            setCalendarOpen(true)}
            }>
            + Plan Session
          </button>

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
          {/* <div className="chat-header" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                        Group Chat
                    </div> */}
          {isLoadingUser ? (
            <p>Loading chat...</p>
          ) : username && localUserId ? (
            <ChatBox groupId={groupId} userId={localUserId} />
          ) : (
            <p>Please log in to access the chat</p>
          )}
        </div>
      )}

      {/* <Modal
        open={inviteOpen}
        title="Invite User"
        onCancel={() => {
          setInviteOpen(false);
          setInviteKey((k) => k + 1);
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
      {calendarOpen && (
        <CalendarAPI
          isOpen={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          groupName={group?.name || "Unnamed Group"}
          userTimezone={user?.timezone || "Europe/Zurich"}
        />
      )}
    </div>
  );
}
