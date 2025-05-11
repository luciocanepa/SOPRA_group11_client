import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title:       "Statistics",
    description: "Your Pomodoro Study Room statistics.",
};

export default function StatisticsLayout({
                                                children,
                                            }: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
