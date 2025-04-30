"use client";

import Link from "next/link";
import "./styles/pages/home.css";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="home">
      <h1> SOPRA group 11</h1>
      <ul id="members">
        <li>Lucio Canepa</li>
        <li>Anna Pang</li>
        <li>Sharon Kelly Isler</li>
        <li>Moritz Leon Böttcher</li>
        <li>Helin Capan</li>
      </ul>

      <div className="button-container">
        <Button>
          <Link href="/login" onClick={() => router.push("/login")}>
            Login
          </Link>
        </Button>

        <Button>
          <Link href="/register" onClick={() => router.push("/register")}>
            Register
          </Link>
        </Button>
      </div>
    </div>
  );
}
