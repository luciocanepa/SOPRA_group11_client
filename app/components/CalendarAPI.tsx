"use client";

import { useEffect, useCallback } from "react";
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
import "../styles/components/CalendarAPI.css";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CalendarPlannerProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  userTimezone: string;
  userId: string;
  groupId: number;
}

interface CalendarForm {
  selectedDate: dayjs.Dayjs;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
}

export function CalendarAPI({
  isOpen,
  onClose,
  groupName,
  userTimezone,
  groupId,
}: CalendarPlannerProps) {
  const { isSignedIn, signInWithGoogle, logOutOfGoogle } = useGoogleCalendar();
  const [form] = Form.useForm<CalendarForm>();
  const api = useApi();
  const { value: token } = useLocalStorage<string>("token", "");

  const resetCalendarForm = useCallback(() => {
    form.resetFields();
  }, [form]);

  useEffect(() => {
    if (isOpen) {
      resetCalendarForm();
    }
  }, [isOpen, resetCalendarForm]);

  const addEventToCalendar = async (values: CalendarForm) => {
    if (!values.selectedDate || !values.startTime) {
      toast.error(
        <div>
          <div>
            <strong>Event creation failed!</strong>
          </div>
          <div>Please make sure to select date and start time</div>
        </div>,
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

    console.log(userTimezone);
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
        userTimezone,
      );

      const endCreatorTimezone = values.endTime
        ? dayjs.tz(
            `${values.selectedDate?.format("YYYY-MM-DD")}T${values.endTime?.format("HH:mm")}`,
            userTimezone,
          )
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
          <div>
            <strong>Sucessfully added to Calendar!</strong>
          </div>
          <div> In regards to your timezone: {userTimezone}</div>
        </div>,
      );
      onClose();
    } catch (error) {
      console.error("Calendar event error:", error);
      toast.error(
        <div>
          <div>
            <strong>Failed to add event to calendar!</strong>
          </div>
          <div>
            {" "}
            If you entered an end-time make sure it is later than the start
            time.
          </div>
        </div>,
      );
    }
  };

  return (
    <div className="group-dashboard-actions-container">
      <div className="calendar-api-container">
      {!isSignedIn ? (
        <div className="calendar-api-container-signin">
          <p>Sign in to get a direct access to your Google Calendar</p>
          <Button className="green" onClick={signInWithGoogle}>
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
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker className="date-picker" />
          </Form.Item>

          <div className="time-picker-container">
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[
                { required: true, message: "Please select a start time" },
              ]}
              className="time-picker-item"
            >
              <TimePicker format="HH:mm" className="full-width" />
            </Form.Item>

            <Form.Item
              label="End Time (optional)"
              name="endTime"
              className="time-picker-item"
            >
              <TimePicker format="HH:mm" className="full-width" />
            </Form.Item>
          </div>

          <div className="button-container">
            <Button
              className="green"
              htmlType="submit"
            >
              Add to Calendar
            </Button>
            <Button
              className="secondary"
              onClick={logOutOfGoogle}
            >
              Log out of Google
            </Button>
          </div>
          </Form>
        )}
      </div>
    </div>
  );
}
