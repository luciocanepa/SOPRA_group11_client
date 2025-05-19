import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Group Dashboard",
  description:
    "View the group and timer, start your session, and chat with other members.",
};

export default function GroupDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
