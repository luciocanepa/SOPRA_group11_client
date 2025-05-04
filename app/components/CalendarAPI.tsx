"use client";

import { useState, useEffect } from "react";
import { Modal, DatePicker, TimePicker, Form, Button } from "antd";
import { gapi } from "gapi-script";
import dayjs, { Dayjs } from "dayjs";
import "@/styles/pages/edit.css";
import "@/styles/pages/login.css";
import "@/styles/pages/calendarAPI.css";

interface CalendarPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  userTimezone: string;
}

export function CalendarAPI({ isOpen, onClose, groupName, userTimezone }: CalendarPlannerProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [calendarView, setCalendarView] = useState<"init" | "form">("init");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  const CLIENT_ID = "132315875574-t1suu2183q7vo2imc8qlfuqa0kenrpq3.apps.googleusercontent.com";
  const SCOPES = "https://www.googleapis.com/auth/calendar.events";


  useEffect(() => {
    if (isOpen) {
      resetCalendarForm();
    }
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

            const authInstance = gapi.auth2.getAuthInstance();
            setIsSignedIn(authInstance.isSignedIn.get());

            if (authInstance.isSignedIn.get()) {
                setIsSignedIn(true);
                setCalendarView("form");
              }
  
      
          } catch (error) {
            console.error("Error initializing Google API client:", error);
          }
        });
      };
      initiateCalendarAPI();

  }, [isOpen]);

  
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
  
      console.log(userTimezone)
    const event = {
      summary: "Study Session with group: " + groupName,
      description: "Planned via the PomodoroTimer WebApplication",
      start: {
        dateTime: studySession.format("YYYY-MM-DDTHH:mm:ss"),
        timeZone: userTimezone,
      },
      end: {
        dateTime: endDateTime.format("YYYY-MM-DDTHH:mm:ss"),
        timeZone: userTimezone,
      },
    };
  
    try {
      await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      alert(`Study session successfully added to your calendar with regards to your timezone: ${userTimezone}`);
      onClose();
    } catch (error) {
      console.error("Calendar event error:", error);
      alert("Failed to add event to calendar. If you entered an end-time make sure it is later than the start time!");
    }
  };


  const resetCalendarForm = () => {
    setSelectedDate(null);
    setStartTime(null);
    setEndTime(null);
  };


  return (
    <Modal
      open={isOpen}
      title="Plan your next Study Session"
      onCancel={onClose}
      footer={null}
      className="groupPage-modal"
    >
      {!isSignedIn ? (
        <div>
          <p>Sign in to get a direct access to your Google Calendar</p>
          <Button className= "button" onClick={signInWithGoogle}>Sign in with Google</Button>
        </div>
      ) : calendarView === "init" ? (
        <div className = "button-row">
          <button className = "button"onClick={() => setCalendarView("form")}>Schedule Session</button>
          <button className = "button"onClick={logOutOfGoogle}>Log out of Google</button>
        </div>
      ) : (
        <Form layout="vertical">
          <Form.Item label="Date">
            <DatePicker onChange={(date) => setSelectedDate(date)} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Start Time">
            <TimePicker onChange={(time) => setStartTime(time)} format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="End Time (optional)">
            <TimePicker onChange={(time) => setEndTime(time)} format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <div className = "button-row">
            <button className = "button" type="button" onClick={addEventToCalendar}>Add to Calendar</button>
            <button className = "button" type="button" onClick={() => setCalendarView("init")}>Back</button>
          </div>
        </Form>
      )}
    </Modal>
  );
}





