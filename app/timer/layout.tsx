import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title:       "Pomodoro Timer",
    description: "Your personal Pomodoro Timer.",
};

export default function PomodoroTimerLayout({
                                                children,
                                            }: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
