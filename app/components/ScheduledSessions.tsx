"use client";

import { useEffect, useState } from "react";
import { Button, Spin, List } from "antd";
import { gapi } from "gapi-script";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendarAPI";
import "@/styles/components/ScheduledSessions.css"
import "@/styles/pages/GroupPage.css"
import "@/styles/globals.css"

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

interface CalendarEntries {
    id: number;
    groupId: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    createdByUsername: string;
}

interface UserProps {
  isOpen: boolean;
  groupId: string;
  userTimezone: string;
}

export default function UpcomingSessions({ isOpen, groupId, userTimezone }: UserProps) {
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const [entry, setEntry] = useState<CalendarEntries[] | null>([]);
  const { value: token } = useLocalStorage<string>("token", "");
  const gid = Number(groupId);
  const { isReady, isSignedIn, signInWithGoogle, logOutOfGoogle } = useGoogleCalendar();
  const [ , setIsOpen] = useState(true)


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        
        const response = await api.get<CalendarEntries[]>(`/calendar-entries/groups/${gid}`, token);
        //const data = await res.json();
        setEntry(response);
        console.log("Fetched entries:", response);
        console.log("Fetching sessions for group:", gid);


      } catch (e) {
        console.error("Failed to fetch upcoming sessions", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [gid, token]);



const handleAddToCalendar = async (session: CalendarEntries) => {
  try {
    if (!isReady) {
      alert("Google Calendar is not initialized yet.");
      return;
    }

    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await signInWithGoogle();
    }

    const startTime = dayjs.tz(session.startTime, "Europe/Zurich").tz(userTimezone).format();
    const endTime = dayjs.tz(session.endTime, "Europe/Zurich").tz(userTimezone).format();

    const event = {
      summary: session.title,
      description: session.description || "",
      start: {
        dateTime: startTime,
        timeZone: userTimezone,
      },
      end: {
        dateTime: endTime,
        timeZone: userTimezone,
      },
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    console.log("Event created:", response);
    alert(`Study session successfully added to your calendar with regards to your timezone: ${userTimezone}`);
    } catch (e) {
    console.error("Calendar event error:", e);
    alert("Failed to add event to calendar.");
  }
};


  if (loading) return <Spin />;



  return (
    <div className="group-dashboard-actions-container">
      <div className="upcoming-events">
        <h4 style={{ marginBottom: '10px' }}>Upcoming Study Sessions</h4>
        {entry && entry?.length > 0 && (
        <>
          <p style={{ fontSize: "13px" }}>Date and Time are set according to your timezone:</p>
          <p style={{ fontSize: "13px", marginBottom: '10px' }}>{userTimezone}</p>
        </>
      )}
        {entry?.length === 0 && <p>No upcoming sessions.</p>}
        {entry?.map((session) => (
          <List key={session.id} style={{ marginBottom: 16 }}>
            <p>
              {session.createdByUsername} scheduled a session:
            </p>
            <p>
              {dayjs.tz(session.startTime, "Europe/Zurich").tz(userTimezone).format("DD-MM-YYYY HH:mm")} -{" "}
              {dayjs.tz(session.endTime, "Europe/Zurich").tz(userTimezone).format("DD-MM-YYYY HH:mm")}
            </p>
            <Button onClick={() => handleAddToCalendar(session)} className="secondary">
              Add this event to your Calendar
            </Button>
          </List>
        ))}
      </div>
    </div>
  );
}
