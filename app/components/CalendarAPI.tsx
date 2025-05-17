"use client";

import { useState, useEffect } from "react";
import { Modal, DatePicker, TimePicker, Form, Button } from "antd";
import { gapi } from "gapi-script";
import dayjs, { Dayjs } from "dayjs";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendarAPI";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import "@/styles/globals.css";
//import "@/styles/pages/login.css";
//import "@/styles/pages/calendarAPI.css";
//import "@/styles/pages/GroupPage.css";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CalendarPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  userTimezone: string;
  userId: string
  groupId: Number;
}

export function CalendarAPI({ isOpen, onClose, groupName, userTimezone, userId, groupId }: CalendarPlannerProps) {
  //const [calendarView, setCalendarView] = useState<"init" | "form">("init");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const { isReady, isSignedIn, signInWithGoogle, logOutOfGoogle } = useGoogleCalendar();

  const api = useApi();
  const { value: token } = useLocalStorage<string>("token", "");


  useEffect(() => {
    if (isOpen) {
      resetCalendarForm();
    }

  }, [isOpen]);


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


      const startCreatorTimezone = dayjs.tz(
        `${selectedDate?.format("YYYY-MM-DD")}T${startTime?.format("HH:mm")}`,
        userTimezone
      );
      
      const endCreatorTimezone = endTime
        ? dayjs.tz(`${selectedDate?.format("YYYY-MM-DD")}T${endTime?.format("HH:mm")}`, userTimezone)
        : startCreatorTimezone.add(1, "hour");
      
      const startZhDefault = startCreatorTimezone.tz("Europe/Zurich");
      const endZhDefault = endCreatorTimezone.tz("Europe/Zurich");
      
      const data = {
        title: event.summary,
        description: event.description,
        startTime: startZhDefault.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: endZhDefault.format("YYYY-MM-DDTHH:mm:ss"),
      };
      

      await api.post(`/calendar-entries/groups/${groupId}`, data, token);

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
    <div className="group-dashboard-actions-container">
      <h4>Plan your next Study Session</h4>
      {!isSignedIn ? (
        <div>
          <p>Sign in to get a direct access to your Google Calendar</p>
          <Button className="secondary" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        </div>
      ) : (
        <Form layout="vertical">
          <Form.Item label="Date">
            <DatePicker onChange={(date) => setSelectedDate(date)} style={{ width: "100%" }} />
          </Form.Item>
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item label="Start Time" style={{ flex: "1" }}>
              <TimePicker onChange={(time) => setStartTime(time)} format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="End Time (optional)" style={{ flex: "1" }}>
              <TimePicker onChange={(time) => setEndTime(time)} format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <Button className = "secondary" onClick={addEventToCalendar} style={{ flex: "1" }}>Add to Calendar</Button>
            <Button className = "secondary" onClick={logOutOfGoogle} style={{ flex: "1" }}>Log out of Google</Button>
          </div>
        </Form>
      )}
    </div>
  );
}

