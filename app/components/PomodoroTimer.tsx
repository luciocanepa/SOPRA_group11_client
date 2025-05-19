// components/PomodoroTimer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import "../styles/components/Timer.css";
import toast from "react-hot-toast";

interface TimerSettings {
  session: number;
  break:   number;
}

interface TimerState {
  timeLeft:               number;
  isRunning:              boolean;
  isSession:              boolean;
  showSettings:           boolean;
  settings:               TimerSettings;
  activeSettings:         TimerSettings;
  notificationPermission: NotificationPermission;
  notificationsEnabled:   boolean;
  alarmEnabled:           boolean;
}

export interface PomodoroTimerProps {
  initialSession?:        number;
  initialBreak?:          number;
  onTimerStatusChange:    (isRunning: boolean) => void;
  onTimerUpdate?:         (info: {
    status:        "WORK" | "BREAK" | "ONLINE" | "OFFLINE";
    startTime:     string;
    duration:      number;
    secondDuration?: number;
  }) => void;
  onSessionStatusChange?: (isSession: boolean) => void;
  fullscreen?:            boolean;
  externalSync?: {
    status:         "WORK" | "BREAK" | "ONLINE" | "OFFLINE";
    startTime:      string;
    duration:       number;
    secondDuration: number;
  } | null;
}

export function PomodoroTimer({
                                initialSession = 25,
                                initialBreak   = 5,
                                onTimerStatusChange,
                                onTimerUpdate,
                                onSessionStatusChange,
                                fullscreen     = false,
                                externalSync,
                              }: PomodoroTimerProps) {
  const [state, setState] = useState<TimerState>({
    timeLeft:     initialSession * 60,
    isRunning:    false,
    isSession:    true,
    showSettings: false,
    settings:     { session: initialSession, break: initialBreak },
    activeSettings: { session: initialSession, break: initialBreak },
    notificationPermission: "default" as NotificationPermission,
    notificationsEnabled:   false,
    alarmEnabled:           true,
  });
  const [justSwitched, setJustSwitched] = useState<boolean|null>(null);
  const [fullScreenMode, setFullScreenMode] = useState(fullscreen);
  const audioRef = useRef<HTMLAudioElement|null>(null);

  // Load alarm
  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.load();
    return () => { audioRef.current?.pause(); };
  }, []);

  // notify running state
  useEffect(() => {
    onTimerStatusChange(state.isRunning);
  }, [state.isRunning, onTimerStatusChange]);

  // countdown when running
  useEffect(() => {
    if (!state.isRunning) return;
    const iv = setInterval(() => {
      setState(st => ({ ...st, timeLeft: Math.max(st.timeLeft - 1, 0) }));
    }, 1000);
    return () => clearInterval(iv);
  }, [state.isRunning]);

  // phase switch
  useEffect(() => {
    if (state.timeLeft > 0) return;
    audioRef.current?.play().catch(() => {});
    setState(prev => {
      const nextIsSession = !prev.isSession;
      const nextDuration  = ( nextIsSession
          ? prev.activeSettings.session
          : prev.activeSettings.break ) * 60;
      const nowISO = new Date().toISOString();

      onTimerUpdate?.({
        status: nextIsSession ? "WORK" : "BREAK",
        startTime: nowISO,
        duration:  nextDuration,
        secondDuration: nextIsSession
            ? prev.activeSettings.break * 60
            : prev.activeSettings.session * 60
      });
      setJustSwitched(nextIsSession);

      return {
        ...prev,
        isSession: nextIsSession,
        timeLeft:  nextDuration,
        isRunning: true
      };
    });
  }, [state.timeLeft, onTimerUpdate]);

  // notify session switch
  useEffect(() => {
    if (justSwitched === null) return;
    onSessionStatusChange?.(justSwitched);
    setJustSwitched(null);
  }, [justSwitched, onSessionStatusChange]);

  // external sync override
  useEffect(() => {
    if (!externalSync) return;
    const running = externalSync.status === "WORK" || externalSync.status === "BREAK";
    const isSess  = externalSync.status === "WORK";
    const otherMins = externalSync.secondDuration / 60;

    setState(s => ({
      ...s,
      isRunning: running,
      isSession: isSess,
      timeLeft:  externalSync.duration,
      activeSettings: {
        session: isSess ? s.activeSettings.session : otherMins,
        break:   !isSess ? s.activeSettings.break : otherMins
      }
    }));
    onTimerStatusChange(running);
    onSessionStatusChange?.(isSess);
  }, [externalSync, onTimerStatusChange, onSessionStatusChange]);

  const fmt = (sec: number) => {
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  };

  const start = () => {
    setState(s => ({ ...s, isRunning: true, showSettings: false }));
    const status = state.isSession ? "WORK" : "BREAK";
    onTimerUpdate?.({
      status,
      startTime: new Date().toISOString(),
      duration:  state.timeLeft,
      secondDuration: state.isSession
          ? state.activeSettings.break * 60
          : state.activeSettings.session * 60
    });
  };

  const stop = () => {
    setState(s => ({ ...s, isRunning: false }));
    onTimerStatusChange(false);
    onTimerUpdate?.({
      status:    "ONLINE",
      startTime: new Date().toISOString(),
      duration:  state.timeLeft
    });
  };

  const reset = () => {
    audioRef.current?.pause();
    setState(s => ({
      ...s,
      isRunning: false,
      isSession: true,
      timeLeft:  s.activeSettings.session * 60
    }));
    onTimerUpdate?.({
      status:    "ONLINE",
      startTime: new Date().toISOString(),
      duration:  initialSession * 60
    });
    toast.success("Timer reset!");
  };

  const toggleSettings = () => setState(s => ({ ...s, showSettings: !s.showSettings }));
  const applySettings  = () => {
    const dur = state.settings.session * 60;
    setState(s => ({
      ...s,
      activeSettings: s.settings,
      timeLeft:       dur,
      isSession:      true,
      showSettings:   false
    }));
    onTimerUpdate?.({
      status:    "ONLINE",
      startTime: new Date().toISOString(),
      duration:  dur
    });
    toast.success("Settings applied!");
  };

  return (
      <div className={`timer-container ${fullScreenMode ? "fullscreen" : ""}`}>
        <div className={`timer-display ${
            state.isRunning
                ? (state.isSession ? "timer-display-work" : "timer-display-break")
                : (state.isSession ? "timer-display-session" : "timer-display-break")
        }`}>
          <h3 className="title">
            {state.isSession ? "Time until break:" : "Break Time"}
          </h3>
          {fmt(state.timeLeft)}
        </div>

        {fullScreenMode
            ? <Button className="fullscreen-button" onClick={() => setFullScreenMode(false)}>-</Button>
            : <Button className="fullscreen-button" onClick={() => setFullScreenMode(true)}>+</Button>
        }

        <div className="timer-button-group">
          <div className="timer-button-group-left">
            <Button onClick={start} disabled={state.isRunning} className="green">Start</Button>
            <Button onClick={stop}  disabled={!state.isRunning} className="red">Stop</Button>
            <Button onClick={reset} className="secondary">Reset</Button>
          </div>
          {!state.isRunning && (
              <Button onClick={toggleSettings} className="secondary">
                {state.showSettings ? "-" : "+"} Timer Settings
              </Button>
          )}
        </div>

        {state.showSettings && (
            <div className="settings-popup">
              <h2 className="popup-title">Timer Settings</h2>
              <div className="settings-row">
                <label>Session (minutes):</label>
                <input
                    type="number"
                    value={state.settings.session}
                    onChange={e => setState(s => ({
                      ...s,
                      settings: { ...s.settings, session: Math.max(1, Number(e.target.value)) }
                    }))}
                    min={1}
                />
              </div>
              <div className="settings-row">
                <label>Break (minutes):</label>
                <input
                    type="number"
                    value={state.settings.break}
                    onChange={e => setState(s => ({
                      ...s,
                      settings: { ...s.settings, break: Math.max(1, Number(e.target.value)) }
                    }))}
                    min={1}
                />
              </div>
              <div className="settings-popup-button-group">
                <Button className="green" onClick={applySettings}>Apply</Button>
                <Button className="red"   onClick={toggleSettings}>Cancel</Button>
              </div>
            </div>
        )}
      </div>
  );
}
