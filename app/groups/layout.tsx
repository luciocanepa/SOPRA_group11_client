import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title:       "Group Creation",
    description: "Create a new Pomodoro Study Room group here.",
};

export default function GroupCreationLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    return <>{children}</>;
}
