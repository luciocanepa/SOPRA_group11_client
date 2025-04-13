
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

interface PomodoroTimerProps {
    initialSession?: number;
    initialBreak?: number;
    onTimerStatusChange: (isRunning: boolean) => void; // New prop to notify the parent about the timer status
}

export function PomodoroTimer({
                                  initialSession = 25,
                                  initialBreak = 5,
                                  onTimerStatusChange
                              }: PomodoroTimerProps) {
    const [state, setState] = useState<TimerState>({
        timeLeft: initialSession * 60,
        isRunning: false,
        isSession: true,
        showSettings: false,
        settings: {
            session: initialSession,
            break: initialBreak
        },
        activeSettings: {
            session: initialSession,
            break: initialBreak
        }
    });

    useEffect(() => {
        onTimerStatusChange(state.isRunning); // Notify parent about timer state
    }, [state.isRunning, onTimerStatusChange]);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/sounds/alarm.mp3');
        audioRef.current.load(); // Preload audio
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    // Countdown timer tick
    useEffect(() => {
        if (!state.isRunning || state.timeLeft <= 0) return;

        const timer = setInterval(() => {
            setState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
        }, 1000);

        return () => clearInterval(timer);
    }, [state.isRunning, state.timeLeft]);

    // Handle timer end (audio + switch)
    useEffect(() => {
        if (!state.isRunning || state.timeLeft > 0) return;

        // Play alarm
        audioRef.current?.play().catch(err => {
            console.warn("Audio failed to play:", err);
        });

        // Slight delay before switching phase
        const timeout = setTimeout(() => {
            const newIsSession = !state.isSession;
            const newTimeLeft = (newIsSession
                ? state.activeSettings.session
                : state.activeSettings.break) * 60;

            setState(prev => ({
                ...prev,
                isSession: newIsSession,
                timeLeft: newTimeLeft
            }));
        }, 1500); // 1.5 seconds delay

        return () => clearTimeout(timeout);
    }, [state.timeLeft, state.isRunning, state.activeSettings, state.isSession]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startTimer = () => setState(prev => ({ ...prev, isRunning: true }));
    const pauseTimer = () => setState(prev => ({ ...prev, isRunning: false }));

    const resetTimer = () => {
        audioRef.current?.pause();
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.load(); // Reset audio state
        }

        setState(prev => ({
            ...prev,
            isRunning: false,
            isSession: true,
            timeLeft: prev.activeSettings.session * 60
        }));
    };

    const applySettings = () => {
        setState(prev => ({
            ...prev,
            activeSettings: { ...prev.settings },
            timeLeft: prev.settings.session * 60,
            isSession: true,
            showSettings: false
        }));
    };

    const setToDefault = () => {
        setState(prev => ({
            ...prev,
            settings: { session: 25, break: 5 }
        }));
    };

    const updateSettings = (newSettings: Partial<TimerSettings>) => {
        setState(prev => {
            const sanitized: Partial<TimerSettings> = {};

            // Sanitize each value to be integer ≥1
            for (const [key, value] of Object.entries(newSettings)) {
                sanitized[key as keyof TimerSettings] = Math.max(1, Math.floor(Number(value)));
            }

            return {
                ...prev,
                settings: { ...prev.settings, ...sanitized }
            };
        });
    };

    const toggleSettings = () => {
        setState(prev => ({
            ...prev,
            showSettings: !prev.showSettings
        }));
    };

    return (
        <div className="white-container">
            <div className="pink-container">
                <h1 className="title">{state.isSession ? "Time until break:" : "Break Time"}</h1>
                <div className="timer-display">{formatTime(state.timeLeft)}</div>
            </div>
            <div className="button-group">
                <button onClick={startTimer} disabled={state.isRunning} className="start">
                    Start
                </button>
                <button onClick={pauseTimer} disabled={!state.isRunning} className="stop">
                    Stop
                </button>
                <button onClick={resetTimer} className="reset">
                    Reset
                </button>
            </div>

            {!state.isRunning && (
                <button onClick={toggleSettings} className="settings-btn">
                    Timer Settings
                </button>
            )}

            {state.showSettings && (
                <div className="settings-popup">
                    <h2 className="popup-title">Timer Settings</h2>
                    <label>Study Duration (minutes):</label>
                    <input
                        type="number"
                        value={state.settings.session}
                        onChange={(e) => updateSettings({ session: Number(e.target.value) })}
                        className="input-box-green"
                        min="1"
                        step="1"
                        pattern="\d*"
                    />
                    <label>Break Duration (minutes):</label>
                    <input
                        type="number"
                        value={state.settings.break}
                        onChange={(e) => updateSettings({ break: Number(e.target.value) })}
                        className="input-box-red"
                        min="1"
                        step="1"
                        pattern="\d*"
                    />
                    <div className="popup-buttons">
                        <button onClick={setToDefault} className="default-btn">
                            Default (25/5)
                        </button>
                        <div className="popup-buttons-row">
                            <button onClick={toggleSettings} className="close">
                                Close
                            </button>
                            <button onClick={applySettings} className="apply-btn">
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
