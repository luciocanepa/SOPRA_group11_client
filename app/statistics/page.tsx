"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useApi } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import { User } from "@/types/user";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Statistics({ user }: { user: User | null }) {
  interface Activity {
    date: string;   // "YYYY-MM-DD"
    duration: number; // minutes
  }

  interface WeekRange {
    start: Date;
    end: Date;
  }

  const apiService = useApi();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<string>("id", "");
  const [loggedInUser, setLoggedInUser] = useState<User | null>(user);
  const [currentWeek, setCurrentWeek] = useState<WeekRange>(getCurrentWeekRange());

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
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Get short day name (Mo, Di, Mi, etc.)
  function getShortDayName(date: Date): string {
    return date.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2);
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const currentDate = new Date(currentWeek.start);
    
    return days.map((day, index) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + index);
      const dateString = date.toISOString().split('T')[0];
      const activity = activities.find(a => a.date === dateString);
      
      return {
        day,
        duration: activity ? activity.duration : 0, // Convert to hours
        fullDate: formatDate(date),
        hasData: !!activity
      };
    });
  }, [activities, currentWeek]);

  // Handle week navigation
  const handleWeekChange = (direction: 'prev' | 'next') => {
    const daysToAdd = direction === 'prev' ? -7 : 7;
    const newStart = new Date(currentWeek.start);
    newStart.setDate(newStart.getDate() + daysToAdd);
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    setCurrentWeek({ start: newStart, end: newEnd });
  };

  useEffect(() => {
    if (!id || !token || user) return;
    const fetchUser = async () => {
      const fetchedUser = await apiService.get(`/users/${id}`, token);
      setLoggedInUser(fetchedUser as User);
    };
    fetchUser();
  }, [id, token, apiService, user]);

  useEffect(() => {
    if (!id || !token) return;
    const fetchAllActivities = async () => {
      try {
        const data = await apiService.get<Activity[]>(`/users/${id}/statistics?aggregate=true`, token);
        setActivities(data);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while getting Activities:\n${error.message}`);
        } else {
          console.error("Fetching activities has failed");
        }
      }
    };
    fetchAllActivities();
  }, [id, token, apiService]);

  return (
    <div className="main-container">
      <Navbar user={loggedInUser} group={null} />
  
      <div className="main-content" style={{ display: "flex", gap: "2rem" }}>
        <div className="statistics-header">
          <h1>Work Time Statistics</h1>
          <div className="week-navigation">
            <button onClick={() => handleWeekChange('prev')} >Prev</button>
            <h2>Week {weekRangeDisplay}</h2>
            <button onClick={() => handleWeekChange('next')}>Next</button>
          </div>
        </div>
  
        <div className="chart-container">
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  formatter={(value) => [`${value} minutes`, "Duration"]}
                  labelFormatter={(label) => {
                    const dayData = chartData.find(d => d.day === label);
                    return dayData ? formatDate(new Date(dayData.fullDate)) : label;
                  }}
                />
                <Bar dataKey="duration" name="Work Duration">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.hasData ? "#4CAF50" : "#E0E0E0"}
                      stroke={entry.hasData ? "#388E3C" : "#BDBDBD"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}