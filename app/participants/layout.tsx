import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Group Members",
  description: "View the group members.",
};

export default function ParticipantsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
