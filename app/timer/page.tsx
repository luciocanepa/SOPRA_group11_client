"use client";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import Navbar from "@/components/Navbar";
export default function Dashboard() {
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
        />
      </div>
    </div>
  );
}
