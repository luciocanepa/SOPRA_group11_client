import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title:       "Edit Your Group",
    description: "Edit your Pomodoro Study Room group.",
};

export default function GroupEditLayout({
                                            children,
                                        }: {
    children: ReactNode;
}) {
    return <>{children}</>;
}