"use client";

import { useState, useEffect, useRef } from "react";
import "../styles/pages/timer.css";

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
                              }: PomodoroTimerProps) {
  const [state, setState] = useState<TimerState>({
    timeLeft: initialSession * 60,
    isRunning: false,
    isSession: true,
    showSettings: false,
    settings: { session: initialSession, break: initialBreak },
    activeSettings: { session: initialSession, break: initialBreak },
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = new Audio("/sounds/alarm.mp3");
    audioRef.current.load();
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
      setState(prev => ({ ...prev, timeLeft: Math.max(prev.timeLeft - 1, 0) }));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.isRunning]);

  // Session <-> Break switch
  useEffect(() => {
    if (state.timeLeft > 0) return;
    audioRef.current?.play().catch(console.warn);
    setState(prev => {
      const nextSession = !prev.isSession;
      const nextDur = (nextSession ? prev.activeSettings.session : prev.activeSettings.break) * 60;
      const nowISO = new Date().toISOString();
      onTimerUpdate?.({ status: nextSession ? "WORK" : "BREAK", startTime: nowISO, duration: nextDur });
      return { ...prev, isSession: nextSession, timeLeft: nextDur, isRunning: true };
    });
  }, [state.timeLeft, state.isSession, state.activeSettings, onTimerUpdate]);

  // Format MM:SS
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers
  const startTimer = () => {
    setState(prev => ({ ...prev, isRunning: true }));
    const nowISO = new Date().toISOString();
    onTimerUpdate?.({ status: "WORK", startTime: nowISO, duration: state.timeLeft });
  };
  const pauseTimer = () => {
    // Stop the local countdown
    setState(prev => ({ ...prev, isRunning: false }));
    onTimerStatusChange(false);

    // Broadcast a BREAK update
    const nowISO = new Date().toISOString();
    onTimerUpdate?.({
      status: "ONLINE",
      startTime: nowISO,
      duration: state.timeLeft
    });
  };

  const resetTimer = () => {
    audioRef.current?.pause();
    setState(prev => ({ ...prev, isRunning: false, isSession: true, timeLeft: prev.activeSettings.session * 60 }));
    const nowISO = new Date().toISOString();
    onTimerUpdate?.({ status: "ONLINE", startTime: nowISO, duration: initialSession * 60 });
  };

  // Settings UI
  const toggleSettings = () => setState(prev => ({ ...prev, showSettings: !prev.showSettings }));
  const updateSettings = (updates: Partial<TimerSettings>) => {
    setState(prev => {
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
      <div className="white-container">
        <div className="pink-container">
          <h1 className="title">{state.isSession ? "Time until break:" : "Break Time"}</h1>
          <div className="timer-display">{formatTime(state.timeLeft)}</div>
        </div>
        <div className="button-group">
          <button onClick={startTimer} disabled={state.isRunning} className="start">Start</button>
          <button onClick={pauseTimer} disabled={!state.isRunning} className="stop">Stop</button>
          <button onClick={resetTimer} className="reset">Reset</button>
        </div>
        {!state.isRunning && <button onClick={toggleSettings} className="settings-btn">Timer Settings</button>}
        {state.showSettings && (
            <div className="settings-popup">
              <h2>Timer Settings</h2>
              <label>Session (minutes):</label>
              <input
                  type="number"
                  value={state.settings.session}
                  onChange={e => updateSettings({ session: Math.max(1, +e.target.value) })}
              />
              <label>Break (minutes):</label>
              <input
                  type="number"
                  value={state.settings.break}
                  onChange={e => updateSettings({ break: Math.max(1, +e.target.value) })}
              />
              <button onClick={applySettings}>Apply</button>
            </div>
        )}
      </div>
  );
}
