"use client";

import React, {useState} from "react";
import {Button} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/pages/LandingPage.css";

const slides = [
  {
    title: "How It Works",
    text: "Here’s a simple step-by-step flow that shows what the app does - and how you’ll use it.",
  },
  {
    title: "1. Create or Join a Group",
    text: "Start a new pomodoro group or accept an invite from a friend, classmate, or coworker.",
  },
  {
    title: "2. Customize Your Space",
    text: "Add a group name, set a photo, and invite members.",
  },
  {
    title: "3. See All Your Groups",
    text: "Your dashboard shows every group you're part of - with quick access to timers, chats, and members.",
  },
  {
    title: "4. Sync & Break Together",
    text: "Use the Sync Break to break together. Everyone stays in sync - work and break at the same time.",
  },
  {
    title: "5. Chat & Collaborate",
    text: "During breaks, chat with your group.",
  },
  {
    title: "6. Track Your Progress",
    text: "See how many sessions you've completed, how long you've focused, and how your productivity is growing over time.",
  },
  {
    title: "7. Personalize Everything",
    text: "Edit your profile, upload a picture, change group settings - make your workspace feel right.",
  },
];

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(1);

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      return prev - 1 < 1 ? slides.length - 1 : prev - 1;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      return prev + 1 >= slides.length ? 1 : prev + 1;
    });
  };
  const router = useRouter();
  return (
      <div className="landing-page">
        <header>
          <h1>
            <em>Focus Together. Achieve More.</em>
          </h1>
          <p>
            A collaborative Pomodoro timer that lets you and your group stay focused,
            take breaks together, and build better work habits - collaboratively.
          </p>
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
        </header>

        <main className="content-columns">
          <div className="info-card">
            <h2>Why This App Exists</h2>
            <p className="red-text">
              Remote work and solo studying are isolating.<br />
              Focus drops. Distractions rise.
            </p>
            <p className="green-text">
              We built this app to help people stay connected <br />
              and focused by using the power of the Pomodoro
              method in real time.
            </p>
          </div>

          <div className="carousel-wrapper">
            <div className="carousel">
              <h2>{slides[0].title}</h2>
              <p>{slides[0].text}</p>

              <hr />

              <div className="slide">
                <h3>{slides[currentIndex].title}</h3>
                <p>{slides[currentIndex].text}</p>
              </div>
              <div className="nav-zone nav-left" onClick={prevSlide}>←</div>
              <div className="nav-zone nav-right" onClick={nextSlide}>→</div>
            </div>

            <div className="enjoy-box">
              Enjoy your Time!
            </div>

            <img src="/tomato_guy.png" alt="Tomato" className="tomato-icon" />
          </div>
        </main>

        <div className="group-members">
          <p>Group 11: Lucio Canepa, Anna Pang, Sharon Kelly Isler, Moritz Leon Böttcher, Helin Capan</p>
        </div>
      </div>
  );
}
