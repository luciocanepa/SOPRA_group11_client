"use client";

import React, { useState } from "react";
import "@/styles/components/Info.css";

const slides = [
  {
    title: "How It Works",
    text: "Here’s a simple step-by-step flow that shows what the app does and how you’ll use it.",
  },
  {
    title: "1. Create or Join a Group",
    text: "Start a new pomodoro group or accept an invite from a friend, classmate, or coworker.",
  },
  {
    title: "2. Customize Your Space",
    text: "Add a group name, set a photo, and invite members.\n\n",
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
    text: "During breaks, chat with your group.\n\n",
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

export default function InfoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(1);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 < 1 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1 >= slides.length ? 1 : prev + 1));
  };

  return (
    <div className="info-card-wrapper">
      <div className="info-card">
        <h3>{slides[0].title}</h3>
        <p>{slides[0].text}</p>
        <hr />
        <div className="slide">
          <h4>{slides[currentIndex].title}</h4>
          <p>{slides[currentIndex].text}</p>
        </div>
        <div className="info-nav">
          <span className="arrow" onClick={prevSlide}>
            ←
          </span>
          <span className="arrow" onClick={nextSlide}>
            →
          </span>
        </div>
      </div>
    </div>
  );
}
