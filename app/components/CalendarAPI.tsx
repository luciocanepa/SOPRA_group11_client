"use client";

import { useEffect } from "react";
import { DatePicker, TimePicker, Form, Button } from "antd";
import { gapi } from "gapi-script";
import dayjs from "dayjs";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendarAPI";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import toast from "react-hot-toast";

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
  groupId: number;
}

interface CalendarForm {
  selectedDate: dayjs.Dayjs;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
}

export function CalendarAPI({ isOpen, onClose, groupName, userTimezone, groupId }: CalendarPlannerProps) {
  const {  isSignedIn, signInWithGoogle, logOutOfGoogle } = useGoogleCalendar();
  const [form] = Form.useForm<CalendarForm>();
  const api = useApi();
  const { value: token } = useLocalStorage<string>("token", "");


  useEffect(() => {
    if (isOpen) {
      resetCalendarForm();
    }

  }, [isOpen]);


  const addEventToCalendar = async (values: CalendarForm) => {
    if (!values.selectedDate || !values.startTime) {
      toast.error(
        <div>
          <div><strong>Event creation failed!</strong></div>
          <div>Please make sure to select date and start time</div>
        </div>
      );
      return;
    }
  
    const studySession = values.selectedDate
      .clone()
      .hour(values.startTime.hour())
      .minute(values.startTime.minute());
  
    const endDateTime = values.endTime
      ? values.selectedDate
      .clone()
      .hour(values.endTime.hour())
      .minute(values.endTime.minute())
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
        `${values.selectedDate?.format("YYYY-MM-DD")}T${values.startTime?.format("HH:mm")}`,
        userTimezone
      );
      
      const endCreatorTimezone = values.endTime
        ? dayjs.tz(`${values.selectedDate?.format("YYYY-MM-DD")}T${values.endTime?.format("HH:mm")}`, userTimezone)
        : startCreatorTimezone.add(1, "hour");
      
      const startZhDefault = startCreatorTimezone.tz("Europe/Zurich");
      const endZhDefault = endCreatorTimezone.tz("Europe/Zurich");
      
      const data = {
        title: event.summary,
        description: event.description,
        startTime: startZhDefault.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: endZhDefault.format("YYYY-MM-DDTHH:mm:ss"),
      };
      

      await api.post(`/groups/${groupId}/calendar-entries`, data, token);

      toast.success(
        <div>
          <div><strong>Sucessfully added to Calendar!</strong></div>
          <div> In regards to your timezone: {userTimezone}</div>
        </div>)
      onClose();
    } catch (error) {
      console.error("Calendar event error:", error);
      toast.error(
        <div>
          <div><strong>Failed to add event to calendar!</strong></div>
          <div> If you entered an end-time make sure it is later than the start time.</div>
        </div>)
    }
  };


  const resetCalendarForm = () => {
    form.resetFields();
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
        <Form<CalendarForm>
          layout="vertical"
          form={form}
          name="calendar"
          onFinish={addEventToCalendar}
        >

          <Form.Item
            label="Date"
            name="selectedDate"
            rules={[{ required: true, message: "Please select a date" }]}>
              <DatePicker style={{ width: "100%" }} />
          </Form.Item>


          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{ required: true, message: "Please select a start time" }]}
              style={{ flex: "1" }}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="End Time (optional)"
              name="endTime"
              style={{ flex: "1" }}>
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
            <Button className = "secondary" htmlType="submit" style={{ flex: "1" }}>Add to Calendar</Button>
            <Button className = "secondary" onClick={logOutOfGoogle} style={{ flex: "1" }}>Log out of Google</Button>
          </div>
        </Form>
      )}
    </div>
  );
}

