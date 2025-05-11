"use client";

import { useEffect, useState } from "react";
import { Button, Card, Spin } from "antd";
import { gapi } from "gapi-script";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendarAPI";
import "@/styles/components/ScheduledSessions.css"

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
  groupId: string;
  userTimezone: string;
}

export default function UpcomingSessions({ groupId, userTimezone }: UserProps) {
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const [entry, setEntry] = useState<CalendarEntries[] | null>([]);
  const { value: token } = useLocalStorage<string>("token", "");
  const gid = Number(groupId);
  const { isReady, isSignedIn, signInWithGoogle, logOutOfGoogle } = useGoogleCalendar();


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

    const event = {
      summary: session.title,
      description: session.description || "",
      start: {
        dateTime: session.startTime,
        timeZone: userTimezone,
      },
      end: {
        dateTime: session.endTime,
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
    <div>
      <Card className= "upcoming-events">
      <h3>Upcoming Study Sessions</h3>
      {entry?.length === 0 && <p>No upcoming sessions.</p>}
      {entry?.map((session) => (
        <Card key={session.id} style={{ marginBottom: 16 }}>
          <p>
            {session.createdByUsername} scheduled a session:
          </p>
          <p>
            {dayjs(session.startTime).format("YYYY-MM-DD HH:mm")} -{" "}
            {dayjs(session.endTime).format("YYYY-MM-DD HH:mm")}
          </p>
          <Button onClick={() => handleAddToCalendar(session)}>
            Add to Calendar
          </Button>
        </Card>
      ))}
      </Card>
    </div>
  );
}
