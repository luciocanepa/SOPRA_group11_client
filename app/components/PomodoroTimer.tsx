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
  onTimerUpdate?: (info: {
    status: "WORK" | "BREAK";
    startTime: string;
    duration: number;
  }) => void;
  fullscreen?: boolean;
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

  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.load();

    // Check notification permission on mount
    if ("Notification" in window) {
      setState((prev) => ({
        ...prev,
        notificationPermission: Notification.permission,
      }));
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // Inform parent of running state
  useEffect(() => {
    onTimerStatusChange(state.isRunning);
  }, [state.isRunning, onTimerStatusChange]);

  // Countdown tick
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

  // Session <-> Break switch
  useEffect(() => {
    if (state.timeLeft > 0) return;

    if (state.alarmEnabled) {
      playAlarm();
    }

    // Show notification when timer phase changes
    if (
      state.notificationsEnabled &&
      state.notificationPermission === "granted"
    ) {
      if (state.isSession) {
        // Session ending - time for break
        showNotification(`Time to BREAK!`, {
          body: `Your study session has ended.`,
        });
      } else {
        // Break ending - time for studying
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
  // Format MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handlers
  const startTimer = () => {
    setState((prev) => ({ ...prev, isRunning: true }));
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
      status: "BREAK",
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
    onTimerUpdate?.({
      status: "BREAK",
      startTime: nowISO,
      duration: initialSession * 60,
    });
  };

  // Settings UI
  const toggleSettings = () =>
    setState((prev) => ({ ...prev, showSettings: !prev.showSettings }));

  const updateSettings = (updates: Partial<TimerSettings>) => {
    setState((prev) => {
      const newSettings = { ...prev.settings, ...updates };
      return { ...prev, settings: newSettings };
    });
  };

  const applySettings = () => {
    setState((prev) => ({
      ...prev,
      activeSettings: prev.settings,
      timeLeft: prev.settings.session * 60,
      isSession: true,
      showSettings: false,
    }));
    const nowISO = new Date().toISOString();
    onTimerUpdate?.({
      status: "WORK",
      startTime: nowISO,
      duration: state.settings.session * 60,
    });
  };
  console.log(state);
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

          <h3 className="popup-title">Sound & Notifications</h3>

          <div className="settings-row">
            <label className="alarm-label">
              <input
                type="checkbox"
                checked={state.alarmEnabled}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    alarmEnabled: e.target.checked,
                  }))
                }
              />
              Enable alarm sound
            </label>
            <Button
              className="secondary"
              onClick={playAlarm}
              disabled={!state.alarmEnabled}
            >
              Test 🔔
            </Button>
          </div>

          <div className="settings-row">
            <label className="notification-label">
              <input
                type="checkbox"
                checked={state.notificationsEnabled}
                onChange={async (e) => {
                  if (e.target.checked) {
                    const permission = await requestNotificationPermission();
                    if (permission === "granted") {
                      setState((prev) => ({
                        ...prev,
                        notificationsEnabled: true,
                      }));
                    }
                  } else {
                    setState((prev) => ({
                      ...prev,
                      notificationsEnabled: false,
                    }));
                  }
                }}
              />
              Enable browser notifications
            </label>
          </div>

          {state.notificationPermission === "denied" && (
            <p className="notification-warning">
              Notifications are blocked. Please update your browser settings.
            </p>
          )}

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
