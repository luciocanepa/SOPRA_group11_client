"use client";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import Navbar from "@/components/Navbar";
import { useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function Dashboard() {
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: localUserId } = useLocalStorage<string>("id", "");

  const handleUpdate = useCallback(
    async ({
      status,
      startTime,
      duration,
    }: {
      status: string;
      startTime: string;
      duration: number;
    }) => {
      if (!token || !localUserId) return;
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const isoDur = `PT${mins}M${secs}S`;
      try {
        await apiService.put(
          `/users/${localUserId}/timer`,
          { status, startTime, duration: isoDur },
          token,
        );
      } catch (e) {
        console.error("Timer update failed", e);
      }
    },
    [apiService, token, localUserId],
  );

  return (
    <div className="page-container">
      <Navbar user={null} />
      <div className="timer-grid">
        <PomodoroTimer
          initialSession={25}
          initialBreak={5}
          onTimerStatusChange={(isRunning) => {
            // You can add logic here to handle timer status changes
            console.log(`Timer is ${isRunning ? "running" : "paused"}`);
          }}
          onTimerUpdate={handleUpdate}
          fullscreen={true}
        />
      </div>
    </div>
  );
}
