"use client";

import Link from "next/link";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import "@/styles/pages/Home.css";
export default function Home() {
  const router = useRouter();
  return (
    <div className="home">
      <h1> Pomodoro time-tracking app</h1>

      <div className="button-container">
        <Button className="secondary">
          <Link href="/login" onClick={() => router.push("/login")}>
            Login
          </Link>
        </Button>

        <Button className="secondary">
          <Link href="/register" onClick={() => router.push("/register")}>
            Register
          </Link>
        </Button>
      </div>

      <div className="group-info">
        <h3>Group 11</h3>
        <ul id="members">
          <li>Lucio Canepa</li>
          <li>Anna Pang</li>
          <li>Sharon Kelly Isler</li>
          <li>Moritz Leon Böttcher</li>
          <li>Helin Capan</li>
        </ul>
      </div>
    </div>
  );
}
