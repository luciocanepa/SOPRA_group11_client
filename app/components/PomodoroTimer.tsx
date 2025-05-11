"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "antd";
import "../styles/components/Timer.css";

interface TimerSettings {
  session: number;
  break: number;
}

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isSession: boolean;
  showSettings: boolean;
  settings: TimerSettings;
  activeSettings: TimerSettings;
  notificationPermission: NotificationPermission;
  notificationsEnabled: boolean;
  alarmEnabled: boolean;
}

export interface PomodoroTimerProps {
  initialSession?: number;
  initialBreak?: number;
  onTimerStatusChange: (isRunning: boolean) => void;
  onTimerUpdate?: (info: { status: "WORK" | "BREAK" | "ONLINE"; startTime: string; duration: number }) => void;
}

export function PomodoroTimer({
  initialSession = 25,
  initialBreak = 5,
  onTimerStatusChange,
  onTimerUpdate,
  fullscreen = false,
}: PomodoroTimerProps) {
  const [state, setState] = useState<TimerState>({
    timeLeft: initialSession * 60,
    isRunning: false,
    isSession: true,
    showSettings: false,
    settings: { session: initialSession, break: initialBreak },
    activeSettings: { session: initialSession, break: initialBreak },
    notificationPermission: "default" as NotificationPermission,
    notificationsEnabled: false,
    alarmEnabled: true,
  });
  const [fullScreen, setFullScreen] = useState(fullscreen);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.load();

    // Request notification permission when the component mounts
    if ("Notification" in window) {
      setState((prev) => ({
        ...prev,
        notificationPermission: Notification.permission,
        notificationsEnabled: Notification.permission === "granted",
      }));
      // Request permission if not already granted
      if (Notification.permission === "default") {
        requestNotificationPermission();
      }
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    onTimerStatusChange(state.isRunning);
  }, [state.isRunning, onTimerStatusChange]);

  useEffect(() => {
    if (!state.isRunning) return;
    const timer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeLeft: Math.max(prev.timeLeft - 1, 0),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.isRunning]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({
        ...prev,
        notificationPermission: permission,
        notificationsEnabled: permission === "granted",
      }));
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  };

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (
        !state.notificationsEnabled ||
        state.notificationPermission !== "granted"
      ) {
        return;
      }

      try {
        new Notification(title, {
          body: options?.body || "",
          icon: "/icons/timer-icon.png",
          ...options,
        });
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [state.notificationsEnabled, state.notificationPermission],
  );

  const playAlarm = useCallback(() => {
    if (!state.alarmEnabled) {
      alert("Please enable alarm sound first");
      return;
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn("Audio playback failed:", error);
        alert(
          "Failed to play alarm sound. Please check your browser settings.",
        );
      });
    }
  }, [state.alarmEnabled]);

  useEffect(() => {
    if (state.timeLeft > 0) return;

    // if (state.alarmEnabled) {
    //   playAlarm();
    // }
    if (state.timeLeft === 0) {
      playAlarm();
    }
    if (
      state.notificationsEnabled &&
      state.notificationPermission === "granted"
    ) {
      if (state.isSession) {
        showNotification(`Time to BREAK!`, {
          body: `Your study session has ended.`,
        });
      } else {
        showNotification(`Time to STUDY!`, {
          body: `Your break has ended.`,
        });
      }
    }

    setState((prev) => {
      const nextSession = !prev.isSession;
      const nextDur =
        (nextSession
          ? prev.activeSettings.session
          : prev.activeSettings.break) * 60;
      const nowISO = new Date().toISOString();
      onTimerUpdate?.({
        status: nextSession ? "WORK" : "BREAK",
        startTime: nowISO,
        duration: nextDur,
      });
      return {
        ...prev,
        isSession: nextSession,
        timeLeft: nextDur,
        isRunning: true,
      };
    });
  }, [
    state.timeLeft,
    state.isSession,
    state.activeSettings,
    onTimerUpdate,
    state.notificationsEnabled,
    state.notificationPermission,
    state.alarmEnabled,
    playAlarm,
    showNotification,
  ]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startTimer = async () => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      showSettings: false, // so settings go away if timer starts
    }));

    const nowISO = new Date().toISOString();
    onTimerUpdate?.({
      status: "WORK",
      startTime: nowISO,
      duration: state.timeLeft,
    });
  };

  const pauseTimer = () => {
    setState((prev) => ({ ...prev, isRunning: false }));
    onTimerStatusChange(false);

    const nowISO = new Date().toISOString();
    onTimerUpdate?.({
      status: "ONLINE",
      startTime: nowISO,
      duration: state.timeLeft,
    });
  };

  const resetTimer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState((prev) => ({
      ...prev,
      isRunning: false,
      isSession: true,
      timeLeft: prev.activeSettings.session * 60,
    }));
    const nowISO = new Date().toISOString();
    onTimerUpdate?.({ status: "ONLINE", startTime: nowISO, duration: initialSession * 60 });
  };

  const toggleSettings = () =>
    setState((prev) => ({ ...prev, showSettings: !prev.showSettings }));

  const updateSettings = (updates: Partial<TimerSettings>) => {
    setState((prev) => {
      const newSettings = { ...prev.settings, ...updates };
      return { ...prev, settings: newSettings };
    });
  };

  const applySettings = () => {
    // snapshot the new session in seconds
    const newSessionSec = state.settings.session * 60;

    // update your own timer display
    setState(prev => ({
      ...prev,
      activeSettings: prev.settings,
      timeLeft:       newSessionSec,
      isSession:      true,
      showSettings:   false,
    }));

    // fire your server update so the WS broadcast comes back
    onTimerUpdate?.({
      status:    "ONLINE",
      startTime: new Date().toISOString(),
      duration:  newSessionSec
    });
  };


  return (
    <div className={`timer-container ${fullScreen ? "fullscreen" : ""}`}>
      <div
        className={`timer-display ${
          state.isRunning
            ? state.isSession
              ? "timer-display-work"
              : "timer-display-break"
            : state.isSession
              ? "timer-display-session"
              : "timer-display-break"
        }`}
      >
        <h3 className="title">
          {state.isSession ? "Time until break:" : "Break Time"}
        </h3>
        {formatTime(state.timeLeft)}
      </div>

      {!fullScreen && (
        <Button
          className="fullscreen-button"
          onClick={() => setFullScreen(true)}
        >
          +
        </Button>
      )}

      {fullScreen && (
        <Button
          className="fullscreen-button"
          onClick={() => setFullScreen(false)}
        >
          -
        </Button>
      )}

      <div className="timer-button-group">
        <div className="timer-button-group-left">
          <Button
            onClick={startTimer}
            disabled={state.isRunning}
            className="green"
          >
            Start
          </Button>
          <Button
            onClick={pauseTimer}
            disabled={!state.isRunning}
            className="red"
          >
            Stop
          </Button>
          <Button onClick={resetTimer} className="secondary">
            Reset
          </Button>
        </div>
        {!state.isRunning && (
          <div>
            <Button onClick={toggleSettings} className="secondary">
              {!state.showSettings ? "+" : "-"} Timer Settings
            </Button>
          </div>
        )}
      </div>

      {state.showSettings && (
        <div className="settings-popup">
          <h2 className="popup-title">Timer Settings</h2>

          <div className="settings-row">
            <label htmlFor="session-input">Session (minutes):</label>
            <input
              min="1"
              step="1"
              id="session-input"
              type="number"
              value={state.settings.session}
              onChange={(e) =>
                updateSettings({
                  session: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                })
              }
            />
          </div>

          <div className="settings-row">
            <label htmlFor="break-input">Break (minutes):</label>
            <input
              min="1"
              step="1"
              id="break-input"
              type="number"
              value={state.settings.break}
              onChange={(e) =>
                updateSettings({
                  break: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                })
              }
            />
          </div>

          <div className="settings-popup-button-group">
            <Button className="green" onClick={applySettings}>
              Apply
            </Button>
            <Button className="red" onClick={toggleSettings}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
