import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Pomodoro Study Room account.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
