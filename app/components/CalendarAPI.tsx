"use client";

import { useState, useEffect } from "react";
import { Modal, DatePicker, TimePicker, Form, Button } from "antd";
import { gapi } from "gapi-script";
import dayjs, { Dayjs } from "dayjs";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendarAPI";

//import "@/styles/pages/edit.css";
//import "@/styles/pages/login.css";
//import "@/styles/pages/calendarAPI.css";
//import "@/styles/pages/GroupPage.css";

interface CalendarPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  userTimezone: string;
  userId: string
  groupId: Number;
}

export function CalendarAPI({ isOpen, onClose, groupName, userTimezone, userId, groupId }: CalendarPlannerProps) {
  const [calendarView, setCalendarView] = useState<"init" | "form">("init");
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

      const data = {title: event.summary,
                    description: event.description,
                    startTime: event.start.dateTime,
                    endTime: event.end.dateTime,
                    }
      console.log("data: ", data)

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





