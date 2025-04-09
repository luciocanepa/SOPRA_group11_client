"use client";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import "../styles/pages/timer.css";

export default function Dashboard() {
    return (
        <div className="timer-grid">
            <PomodoroTimer initialSession={25} initialBreak={5} />
        </div>
    );
}

//Older code:
// "use client";
//
// import { useState, useEffect, useRef } from "react";
// import "../styles/pages/timer.css";
//
//
// export default function PomodoroTimer() {
//     // Timer settings
//     const [sessionLength, setSessionLength] = useState(25);
//     const [breakLength, setBreakLength] = useState(5);
//     const [timeLeft, setTimeLeft] = useState(sessionLength * 60);
//     const [isRunning, setIsRunning] = useState(false);
//     const [isSession, setIsSession] = useState(true);
//     const [showSettings, setShowSettings] = useState(false);
//     const [appliedSettings, setAppliedSettings] = useState({
//         session: 25,
//         break: 5
//     })
//     const audioRef = useRef<HTMLAudioElement | null>(null); ///////////////////
//
//
//     // Timer effect
//     useEffect(() => {
//
//         audioRef.current = new Audio('/sounds/alarm.mp3'); //////////////////
//
//         let timer;
//         if (isRunning && timeLeft > 0) {
//             timer = setInterval(() => {
//                 setTimeLeft(prev => prev - 1);
//             }, 1000);
//         } else if (isRunning && timeLeft <= 0) {
//             audioRef.current?.play(); ////////////////////////////////////
//             setIsSession(prev => !prev);
//             setTimeLeft((isSession ? breakLength : sessionLength) * 60);
//         }
//         return () => clearInterval(timer);
//     }, [isRunning, timeLeft, sessionLength, breakLength, isSession]);
//
//     // Format time display
//     const formatTime = (seconds: number) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//     };
//
//     // Control functions
//     const startTimer = () => setIsRunning(true);
//     const pauseTimer = () => setIsRunning(false);
//     const resetTimer = () => {
//         audioRef.current?.pause(); /////////////////////
//         audioRef.current!.currentTime = 0  /////////////////////
//         setIsRunning(false);
//         setIsSession(true);
//         setTimeLeft(appliedSettings.session * 60);
//     };
//
//     const applySettings = () => {
//         setAppliedSettings({
//             session: sessionLength,
//             break: breakLength
//         });
//         setTimeLeft(sessionLength * 60);
//         setIsSession(true);
//         setShowSettings(false);
//     };
//
//     const setToDefault = () => {
//         setSessionLength(25);
//         setBreakLength(5);
//     };
//
//     return (
//         <div className="white-container">
//         <div className="pink-container">
//             <h1 className="title">{isSession ? "Time until break:" : "Break Time"}</h1>
//             <div className="timer-display">{formatTime(timeLeft)}</div>
//         </div>
//             <div className="button-group">
//                 <button onClick={startTimer} disabled={isRunning} className="start">
//                     Start
//                 </button>
//                 <button onClick={pauseTimer} disabled={!isRunning} className="stop">
//                     Stop
//                 </button>
//                 <button onClick={resetTimer} className="reset">
//                     Reset
//                 </button>
//             </div>
//
//             {!isRunning && (
//                 <button onClick={() => setShowSettings(true)} className="settings-btn">
//                     Timer Settings
//                 </button>
//             )}
//
//             {showSettings && (
//                 <div className="settings-popup">
//                     <h2 className="popup-title">Timer Settings</h2>
//                     <label>Study Duration (minutes):</label>
//                     <input
//                         type="number"
//                         value={sessionLength}
//                         onChange={(e) => setSessionLength(Number(e.target.value))}
//                         className="input-box-green"
//                         min="1"
//                     />
//                     <label>Break Duration (minutes):</label>
//                     <input
//                         type="number"
//                         value={breakLength}
//                         onChange={(e) => setBreakLength(Number(e.target.value))}
//                         className="input-box-red"
//                         min="1"
//                     />
//                     <div className="popup-buttons">
//                         <button onClick={setToDefault} className="default-btn">
//                             Default (25/5)
//                         </button>
//                         <div className="popup-buttons-row">
//                             <button onClick={() => setShowSettings(false)} className="close">
//                                 Close
//                             </button>
//                             <button onClick={applySettings} className="apply-btn">
//                                 Apply
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//
//         </div>
//     );
// }