// components/PomodoroTimer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import "../styles/components/Timer.css";
import toast from "react-hot-toast";
import { User } from "@/types/user";
import { TimerInfo } from "@/hooks/useGroupParticipants";

interface TimerSettings {
  session: number;
  break: number;
}

interface PomodoroTimerProps {
  initialSession?: number;
  initialBreak?: number;
  onTimerStatusChange: (isRunning: boolean) => void;
  onActiveDurationsChange?: (durations: { session: number; break: number }) => void;
  onTimerUpdate?: (info: {
    status: "WORK" | "BREAK" | "ONLINE" | "OFFLINE";
    startTime: string;
    duration: number;
    secondDuration?: number;
  }) => void;
  onSessionStatusChange?: (isSession: boolean) => void;
  fullscreen?: boolean;
  externalSync?: {
    status: "WORK" | "BREAK" | "ONLINE" | "OFFLINE";
    startTime: string;
    duration: number;
    originalDuration: number;
    secondDuration: number;
  } | null;
  user?: User | null;
  timers?: Record<number, TimerInfo>;
}

export function PomodoroTimer({
                                initialSession = 25,
                                initialBreak = 5,
                                onTimerStatusChange,
                                onTimerUpdate,
                                onSessionStatusChange,
                                fullscreen = false,
                                externalSync,
                                onActiveDurationsChange,
    user,
    timers,
                              }: PomodoroTimerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [settings, setSettings] = useState<TimerSettings>({
    session: initialSession,
    break: initialBreak,
  });

  const [activeDurations, setActiveDurations] = useState({
    session: initialSession * 60,
    break: initialBreak * 60,
  });

  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(initialSession * 60);
  const [timeLeft, setTimeLeft] = useState(initialSession * 60);
  const [isSession, setIsSession] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState(fullscreen);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const fmt = (sec: number) =>
      `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60)
          .toString()
          .padStart(2, "0")}`;

  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.load();

    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        setNotificationsEnabled(permission === "granted");
      });
    }

    return () => audioRef.current?.pause();
  }, []);

  useEffect(() => {
    onTimerStatusChange(isRunning);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || startTime === null) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current?.play().catch(() => {});
      }

        const nextIsSession = !isSession;
        const nextDuration = nextIsSession
            ? activeDurations.session
            : activeDurations.break;

        const adjustedStart = Date.now() - 1000; // offset for drift
        const nowISO = new Date(adjustedStart).toISOString();

        if (notificationsEnabled) {
          new Notification(nextIsSession ? "Time to STUDY!" : "Time to BREAK!", {
            body: nextIsSession ? "Your break has ended." : "Your study session has ended.",
            icon: "/tomato_guy.png",
          });
        }

        onTimerUpdate?.({
          status: nextIsSession ? "WORK" : "BREAK",
          startTime: nowISO,
          duration: nextDuration,
          secondDuration: nextIsSession
              ? activeDurations.break
              : activeDurations.session,
        });
        onSessionStatusChange?.(nextIsSession);

        setIsSession(nextIsSession);
        setStartTime(Date.now());
        setDuration(nextDuration);
        setTimeLeft(nextDuration);
      }
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(timerRef.current!);
  }, [isRunning, startTime, duration, isSession]);

  const [hasInitializedFromTimers, setHasInitializedFromTimers] = useState(false);

  useEffect(() => {
    if (hasInitializedFromTimers || externalSync || !user || !timers) return;
    const wasJustReset = localStorage.getItem("justReset") === "true";

    if (wasJustReset) {
      const session = settings.session * 60;
      setIsSession(true);
      setIsRunning(false);
      setStartTime(null);
      setDuration(session);
      setTimeLeft(session);
      setActiveDurations({
        session,
        break: settings.break * 60,
      });

      onSessionStatusChange?.(true);
      onTimerStatusChange(false);
      onTimerUpdate?.({
        status: "ONLINE",
        startTime: new Date().toISOString(),
        duration: session,
      });

      setHasInitializedFromTimers(true);
      localStorage.removeItem("justReset"); // ✅ clean up

      return;
    }

    const userId = Number(user.id);
    if (isNaN(userId)) return;

    const myTimer = timers[userId];

    if (!myTimer) return;

    const now = Date.now();
    const end = myTimer.start.getTime() + myTimer.duration * 1000;
    const remaining = Math.max(0, Math.floor((end - now) / 1000));

    setIsRunning(myTimer.running);
    setStartTime(now);
    setDuration(remaining);
    setTimeLeft(remaining);

    const sessionStatus = user.status === "WORK";
    setIsSession(sessionStatus);
    onTimerStatusChange(myTimer.running);
    onSessionStatusChange?.(sessionStatus);

    setHasInitializedFromTimers(true);
  }, [user, timers, externalSync, hasInitializedFromTimers]);



  useEffect(() => {
    if (!externalSync) return;

    const running = externalSync.status === "WORK" || externalSync.status === "BREAK";
    const isSess = externalSync.status === "WORK";

    const remaining = externalSync.duration;
    const fullCurrent = externalSync.originalDuration;
    const fullOther = externalSync.secondDuration;

    const newDurations = {
      session: isSess ? fullCurrent : fullOther,
      break:   isSess ? fullOther   : fullCurrent,
    };


    setIsRunning(running);
    setIsSession(isSess);
    setStartTime(Date.now());
    setDuration(remaining);
    setTimeLeft(remaining);
    setActiveDurations(newDurations);
    onActiveDurationsChange?.(newDurations);

    onTimerStatusChange(running);
    onSessionStatusChange?.(isSess);
  }, [externalSync, onTimerStatusChange, onSessionStatusChange, onActiveDurationsChange]);


  const start = () => {
    if (timeLeft <= 0) return;
    localStorage.removeItem("justReset");
    const now = Date.now();
    setStartTime(now);
    setDuration(timeLeft);
    setIsRunning(true);
    setShowSettings(false);

    onTimerUpdate?.({
      status: isSession ? "WORK" : "BREAK",
      startTime: new Date(now).toISOString(),
      duration: timeLeft,
      secondDuration: isSession
          ? activeDurations.break
          : activeDurations.session,
    });
  };

  const stop = () => {
    localStorage.removeItem("justReset");
    if (startTime !== null) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    }
    setIsRunning(false);
    setStartTime(null);
    onTimerStatusChange(false);
    onTimerUpdate?.({
      status: "ONLINE",
      startTime: new Date().toISOString(),
      duration: timeLeft,
    });
  };

  const reset = () => {
    const dur = settings.session * 60;
    setIsRunning(false);
    setIsSession(true);
    setStartTime(null);
    setDuration(dur);
    setTimeLeft(dur);
    setActiveDurations({
      session: dur,
      break: settings.break * 60,
    });
    localStorage.setItem("justReset", "true");
    onTimerUpdate?.({
      status: "ONLINE",
      startTime: new Date().toISOString(),
      duration: dur,
    });
    toast.success("Timer reset!");
    onSessionStatusChange?.(true);
  };

  const applySettings = () => {
    const session = settings.session * 60;
    const breakDur = settings.break * 60;
    setActiveDurations({ session, break: breakDur });
    onActiveDurationsChange?.({ session, break: breakDur });
    setTimeLeft(session);
    setIsSession(true);
    setIsRunning(false);
    setShowSettings(false);
    onTimerUpdate?.({
      status: "ONLINE",
      startTime: new Date().toISOString(),
      duration: session,
    });
    toast.success("Settings applied!");
  };

  return (
      <div className={`timer-container ${fullScreenMode ? "fullscreen" : ""}`}>
        <div
            className={`timer-display ${
                isRunning
                    ? isSession
                        ? "timer-display-work"
                        : "timer-display-break"
                    : isSession
                        ? "timer-display-session"
                        : "timer-display-break"
            }`}
        >
          <h3 className="title">
            {isSession ? "Time until break:" : "Break Time"}
          </h3>
          {fmt(timeLeft)}
        </div>

        <Button
            className="fullscreen-button"
            onClick={() => setFullScreenMode(!fullScreenMode)}
        >
          {fullScreenMode ? "-" : "+"}
        </Button>

        <div className="timer-button-group">
          <div className="timer-button-group-left">
            <Button onClick={start} disabled={isRunning || timeLeft <= 0} className="green">
              Start
            </Button>
            <Button onClick={stop} disabled={!isRunning} className="red">
              Stop
            </Button>
            <Button onClick={reset} className="secondary">
              Reset
            </Button>
          </div>
          {!isRunning && (
              <Button
                  onClick={() => setShowSettings(!showSettings)}
                  className="secondary"
              >
                {showSettings ? "-" : "+"} Timer Settings
              </Button>
          )}
        </div>

        {showSettings && (
            <div className="settings-popup">
              <h2 className="popup-title">Timer Settings</h2>
              <div className="settings-row">
                <label>Session (minutes):</label>
                <input
                    type="text"
                    value={String(settings.session)}
                    className={
                      !settings.session || settings.session < 1
                          ? "timer-input-error"
                          : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setSettings((s) => ({ ...s, session: 0 }));
                      } else if (/^\d+$/.test(val)) {
                        setSettings((s) => ({ ...s, session: Math.floor(Number(val)) }));
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      const num = Number(val);
                      if (!val || isNaN(num) || num < 1) {
                        setSettings((s) => ({ ...s, session: 0 }));
                      } else {
                        setSettings((s) => ({ ...s, session: Math.floor(num) }));
                      }
                    }}
                    placeholder="Enter minutes"
                />
              </div>
              <div className="settings-row">
                <label>Break (minutes):</label>
                <input
                    type="text"
                    value={String(settings.break)}
                    className={
                      !settings.break || settings.break < 1
                          ? "timer-input-error"
                          : ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setSettings((s) => ({ ...s, break: 0 }));
                      } else if (/^\d+$/.test(val)) {
                        setSettings((s) => ({ ...s, break: Math.floor(Number(val)) }));
                      }
                    }}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      const num = Number(val);
                      if (!val || isNaN(num) || num < 1) {
                        setSettings((s) => ({ ...s, break: 0 }));
                      } else {
                        setSettings((s) => ({ ...s, break: Math.floor(num) }));
                      }
                    }}
                    placeholder="Enter minutes"
                />
              </div>
              <div className="settings-popup-button-group">
                <Button
                    className="green"
                    onClick={() => {
                      if (settings.session < 1 || settings.break < 1) {
                        toast.error("Input a number ≥1 in both fields.");
                        return;
                      }
                      applySettings();
                    }}
                >
                  Apply
                </Button>
                <Button className="red" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
              </div>
            </div>
        )}
      </div>
  );
}