// app/dashboard/layout.tsx
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title:       "Dashboard",
    description: "View your Pomodoro Timer groups and statistics.",
};

export default function DashboardLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
