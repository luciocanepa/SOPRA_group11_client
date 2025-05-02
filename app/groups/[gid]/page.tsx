"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { GroupParticipants } from "@/components/GroupParticipants";
import { Modal, Card, DatePicker, TimePicker, Form, message } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { InviteUser } from "@/components/InviteUser";
import "@/styles/pages/login.css"; // keep her unified styles
import { gapi } from "gapi-script";
import dayjs, { Dayjs } from "dayjs";



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

  const CLIENT_ID = "132315875574-t1suu2183q7vo2imc8qlfuqa0kenrpq3.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [groupData, setGroupData] = useState<Group | null>(null);
  const [userData, setUserData] = useState<User | null>(null);


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


    const initiateCalendarAPI = () => {
      gapi.load("client:auth2", async () => {
        try {
          await gapi.client.init({
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
            ],
          });
    
          await gapi.client.load("calendar", "v3");
    
        } catch (error) {
          console.error("Error initializing Google API client:", error);
        }
      });
    };
    initiateCalendarAPI();

  }, [groupId, apiService, localUserId, token]);




  const signInWithGoogle = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      setIsSignedIn(true);
      const user = authInstance.currentUser.get();


      const grantedScopes = user.getGrantedScopes();
      console.log("Granted Scopes:", grantedScopes);

    } catch (error) {
      console.error("Google Sign-in error", error);
      alert("Signing-in with Google failed.");
    }
  };


  const logOutOfGoogle = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setIsSignedIn(false);
      alert("Signed out of Google.");
    } catch (error) {
      console.error("Google Sign-out error:", error);
      alert("Sign-out failed.");
    }
  }



  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [calendarView, setOpenCalendarView] = useState<"init" | "form">("init");


  const addEventToCalendar = async () => {
    if (!selectedDate || !startTime) {
      alert("Please select date and start time");
      return;
    }
  
    const studySession = selectedDate
      .clone()
      .hour(startTime.hour())
      .minute(startTime.minute());
  
    const endDateTime = endTime
      ? selectedDate
      .clone()
      .hour(endTime.hour())
      .minute(endTime.minute())
      : studySession.add(1, "hour");
  
    const event = {
      summary: "Study Session with group: " + groupData?.name,
      description: "Planned via the PomodoroTimer WebApplication",
      start: {
        dateTime: studySession.toISOString(),
        timeZone: "Europe/Zurich",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Europe/Zurich",
      },
    };
  
    try {
      await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      alert("Event successfully added to your calendar!");
      setCalendarModalOpen(false);
    } catch (error) {
      console.error("Calendar event error:", error);
      alert("Failed to add event to calendar.");
    }
  };
  
  const resetCalendarForm = () => {
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
    setOpenCalendarView("init");
  };
  




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
            resetCalendarForm();
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
      <Modal
        open={calendarModalOpen}
        title="Plan Study Session"
        onCancel={() => setCalendarModalOpen(false)}
        footer={null}
        className="groupPage-modal"
      >
        <p>📅 Google Calendar!</p>
        {!isSignedIn ? (
        <>
        <p>Sign in with your google account to enable access to your google calendar</p>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
        </>
        ) : calendarView === "init" ? (
        <>
        <button
          className="start"
          onClick={() => setOpenCalendarView("form")}
        >
          Schedule next Session
        </button>
        <button type="button" className="reset" onClick={logOutOfGoogle}>
          Log out of Google
        </button></>
        ) : (
        <Form layout="vertical">
          <Form.Item label="Session Date">
            <DatePicker
              onChange={(date) => setSelectedDate(date)}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Start Time">
            <TimePicker
              onChange={(time) => setStartTime(time)}
              format="HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="End Time (optional)">
            <TimePicker
              onChange={(time) => setEndTime(time)}
              format="HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <button type = "button" className="start" onClick={addEventToCalendar}>
            Confirm & Add to Calendar
          </button>
          <button type="button" className="reset" onClick={() => setOpenCalendarView("init")}>
            Back
          </button>
        </Form>
      )}

      </Modal>
    </div>
  );
}
