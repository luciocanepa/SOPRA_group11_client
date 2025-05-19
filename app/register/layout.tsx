import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new Pomodoro Study Room account.",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
