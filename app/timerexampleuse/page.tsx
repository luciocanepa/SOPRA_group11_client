"use client";
import { PomodoroTimer } from "@/components/PomodoroTimer";

export default function Dashboard() {
  return (
    <div className="timer-grid">
      <PomodoroTimer
        initialSession={25}
        initialBreak={5}
        onTimerStatusChange={(isRunning) => {
          // You can add logic here to handle timer status changes
          console.log(`Timer is ${isRunning ? "running" : "paused"}`);
        }}
      />
      <PomodoroTimer
        initialSession={1}
        initialBreak={5}
        onTimerStatusChange={(isRunning) => {
          // You can add logic here to handle timer status changes
          console.log(`Timer is ${isRunning ? "running" : "paused"}`);
        }}
      />
    </div>
  );
}
