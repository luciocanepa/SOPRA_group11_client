"use client";
import { PomodoroTimer } from "@/components/PomodoroTimer";

export default function Dashboard() {
    return (
        <div className="timer-grid">
            <PomodoroTimer initialSession={25} initialBreak={5} />
            <PomodoroTimer initialSession={1} initialBreak={5} />
        </div>
    );
}