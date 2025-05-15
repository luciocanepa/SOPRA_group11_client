"use client";

import React, { useEffect, useState, useMemo } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import { User } from "@/types/user";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button, Card, Select } from "antd";

import "../styles/module.css";
import "../styles/pages/Statistics.css";

export default function Statistics() {
  interface Activity {
    date: string; // "YYYY-MM-DD"
    duration: number; // minutes
  }

  interface WeekRange {
    start: Date;
    end: Date;
  }
  
  interface Group {
    id: string;
    name: string;
  }

  interface GroupActivity {
    username: string;
    aggregatedActivities: Activity[];
  }

  const apiService = useApi();
  const [activities, setActivities] = useState<Activity[]>([]);
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<string>("id", "");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeekRange>(
    getCurrentWeekRange(),
  );
  const [mode, setMode] = useState<"user" | "group">("user");
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups.length > 0 ? groups[0].id : null);
  const [groupActivityData, setGroupActivityData] = useState<GroupActivity[]>([]);

  // Get current week range (Monday to Sunday)
  function getCurrentWeekRange(): WeekRange {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const start = new Date(now.setDate(diff));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  // Format week range for display
  const weekRangeDisplay = useMemo(() => {
    return `${formatDate(currentWeek.start)} - ${formatDate(currentWeek.end)}`;
  }, [currentWeek]);

  // Format date as DD.MM.YYYY
  function formatDate(date: Date): string {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    const currentDate = new Date(currentWeek.start);

    return days.map((day, index) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + index);
      const dateString = date.toISOString().split("T")[0];
      const activity = activities.find((a) => a.date === dateString);

      return {
        day,
        duration: activity ? activity.duration : 0, // Convert to hours
        fullDate: formatDate(date),
        hasData: !!activity,
      };
    });
  }, [activities, currentWeek]);

  const groupChartData = useMemo(() => {
  if (mode !== "group") return [];

  const days = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const currentDate = new Date(currentWeek.start);

  return days.map((dayLabel, index) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + index);
    const dateString = date.toISOString().split("T")[0];

    const userDurations: Record<string, number> = {};
    groupActivityData.forEach((user) => {
      const activity = user.aggregatedActivities.find((a) => a.date === dateString);
      userDurations[user.username] = activity ? activity.duration : 0;
    });

    return {
      day: dayLabel,
      fullDate: formatDate(date),
      ...userDurations, // Spread usernames as keys with durations
    };
  });
}, [groupActivityData, currentWeek, mode]);

  // Handle week navigation
  const handleWeekChange = (direction: "prev" | "next") => {
    const daysToAdd = direction === "prev" ? -7 : 7;
    const newStart = new Date(currentWeek.start);
    newStart.setDate(newStart.getDate() + daysToAdd);
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    setCurrentWeek({ start: newStart, end: newEnd });
  };

  useEffect(() => {
    if (!id || !token) return;
    const fetchUser = async () => {
      const fetchedUser = await apiService.get(`/users/${id}`, token);
      setLoggedInUser(fetchedUser as User);
    };
    fetchUser();
  }, [id, token, apiService]);

  useEffect(() => {
    if (!id || !token) return;
    const fetchAllActivities = async () => {
      try {
        const data = await apiService.get<Activity[]>(
          `/users/${id}/statistics?aggregate=true`,
          token,
        );
        setActivities(data);
      } catch (error) {
        if (error instanceof Error) {
          alert(
            `Something went wrong while getting Activities:\n${error.message}`,
          );
        } else {
          console.error("Fetching activities has failed");
        }
      }
    };
    fetchAllActivities();
  }, [id, token, apiService]);

  useEffect(() => {
    if (mode === "user" || !token) return;
    const fetchGroups = async () => {
      try {
        const data = await apiService.get<Group[]>(`/groups`,token);
        setGroups(data);
        if (data.length > 0) setSelectedGroupId(data[0].id);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while getting Groups:\n${error.message}`);
        } else {
          console.error("Fetching groups has failed");
        }
      }
    };
    fetchGroups();
  },[mode,token, apiService]);

  useEffect(() => {
  const fetchGroupActivities = async () => {
    if (mode !== "group" || !selectedGroupId || !token) return;

    try {
      const start = currentWeek.start.toISOString().split("T")[0];
      const end = currentWeek.end.toISOString().split("T")[0];

      const data = await apiService.get<GroupActivity[]>(
        `/groups/${selectedGroupId}/statistics?aggregate=true&startDate=${start}&endDate=${end}`,
        token
      );
      setGroupActivityData(data);
    } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while getting group activities:\n${error.message}`,);
        } else {
          console.error("Fetching group activities has failed");
        }
      }
  };

  fetchGroupActivities();
}, [mode, selectedGroupId, currentWeek, token]);

  return (
    <>
      <Navbar user={loggedInUser} />

      <div className="page-container">
        <Card className="card statistics-card">
          <div className="statistics-header">
            <h2>Work Time Statistics</h2>
            <div className="mode-toggle">
              <Button
                className="green"
                disabled={mode === "user"}
                onClick={() => setMode("user")}
              >
                User
              </Button>
              <Button
                className="red"
                disabled={mode === "group"}
                onClick={() => setMode("group")}
              >
                Group
              </Button>
              {mode === "group" && (
                <Select
                  className="select"
                  value = {selectedGroupId}
                  onChange={(groupId) => setSelectedGroupId(groupId)}
                  options={groups.map((group) => ({
                    label: group.name,
                    value: group.id,
                  }))}
                />
              )}
              
              </div> 
            <div className="week-navigation">
              <Button
                className="secondary"
                onClick={() => handleWeekChange("prev")}
              >
                ←
              </Button>
              <h3>Week {weekRangeDisplay}</h3>
              <Button
                className="secondary"
                onClick={() => handleWeekChange("next")}
              >
                →
              </Button>
            </div>
          </div>
        </Card>
        <div className="chart-container shadow">
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mode === "user" ? chartData : groupChartData}>
                <XAxis dataKey="day" />
                <YAxis
                  label={{
                    value: "Minutes",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [`${value} minutes`, name]}
                  labelFormatter={(label) => {
                    const data = (mode === "user" ? chartData : groupChartData).find(
                      (d) => d.day === label,
                    );
                    return data?.fullDate || label;
                  }}
                />
                {mode === "user" ? (
                  <Bar dataKey="duration" name="Work Duration">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.hasData ? "#2D7DA4" : "#E0E0E0"}
                        stroke={entry.hasData ? "#2D7DA4" : "#BDBDBD"}
                      />
                    ))}
                  </Bar>
                ): (
                  groupActivityData.map((user) => (
                    <Bar
                      key={user.username}
                      dataKey={user.username}
                      name={user.username}
                    />
                      
                  ))
                  )}
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}
