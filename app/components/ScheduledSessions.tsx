"use client";

import { useEffect, useState } from "react";
import { Button, Spin, List } from "antd";
import { gapi } from "gapi-script";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendarAPI";
import "@/styles/components/ScheduledSessions.css";
import toast from "react-hot-toast";

import "@/styles/pages/GroupPage.css";
import "../styles/components/ScheduledSessions.css";

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

export default function UpcomingSessions({ groupId, userTimezone }: UserProps) {
  const [loading, setLoading] = useState(true);
  const api = useApi();
  const [entry, setEntry] = useState<CalendarEntries[] | null>([]);
  const { value: token } = useLocalStorage<string>("token", "");
  const gid = Number(groupId);
  const { isReady, signInWithGoogle } = useGoogleCalendar();
  //const [ , setIsOpen] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get<CalendarEntries[]>(
          `/groups/${gid}/calendar-entries`,
          token,
        );
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
  }, [gid, token, api]);

  const handleAddToCalendar = async (session: CalendarEntries) => {
    try {
      if (!isReady) {
        toast.error(
          <div>
            <div>
              <strong>Google Calendar is not initialized yet.</strong>
            </div>
          </div>,
        );
        return;
      }

      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await signInWithGoogle();
      }

      const startTime = dayjs
        .tz(session.startTime, "Europe/Zurich")
        .tz(userTimezone)
        .format();
      const endTime = dayjs
        .tz(session.endTime, "Europe/Zurich")
        .tz(userTimezone)
        .format();

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
      toast.success(
        <div>
          <div>
            <strong>Sucessfully added to Calendar!</strong>
          </div>
          <div> In regards to your timezone: {userTimezone}</div>
        </div>,
      );
    } catch (e) {
      console.error("Calendar event error:", e);
      toast.error(
        <div>
          <div>
            <strong>Failed to add event to calendar.</strong>
          </div>
        </div>,
      );
    }
  };

  if (loading) return <Spin />;

  return (
    <div className="group-dashboard-actions-container">
      <div className="upcoming-events">
        {entry && entry?.length > 0 && (
            <p id="timezone-info">
              Date and Time for the timezone: {userTimezone}
            </p>
        )}
        {entry?.length === 0 && <p id="no-sessions">No upcoming sessions.</p>}
        {entry?.map((session) => (
          <List key={session.id}>
            <p id="session-info">
              {session.createdByUsername} scheduled a session:
            </p>
            <p>
              {dayjs
                .tz(session.startTime, "Europe/Zurich")
                .tz(userTimezone)
                .format("DD-MM-YYYY HH:mm")}{" "}
              -{" "}
              {dayjs
                .tz(session.endTime, "Europe/Zurich")
                .tz(userTimezone)
                .format("DD-MM-YYYY HH:mm")}
            </p>
            <Button
              onClick={() => handleAddToCalendar(session)}
              className="secondary"
            >
              Add to Google Calendar
            </Button>
          </List>
        ))}
      </div>
    </div>
  );
}
