import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Edit Your Profile",
  description: "Edit your Pomodoro Study Room profile.",
};

export default function ProfileEditLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
