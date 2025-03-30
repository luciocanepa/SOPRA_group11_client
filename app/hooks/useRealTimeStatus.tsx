// app/hooks/useRealTimeStatus.tsx
import { useState, useEffect } from "react";

export const useRealTimeStatus = () => {
    const [statuses, setStatuses] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const socket = new WebSocket("ws://your-websocket-url");

        socket.onopen = () => {
            console.log("WebSocket connection established.");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStatuses(data.statuses); // Assuming server sends updated status in { statuses: [...] }
        };

        socket.onerror = (err) => {
            setError("Failed to connect to the WebSocket.");
            console.error("WebSocket error:", err);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        // Cleanup on component unmount
        return () => {
            socket.close();
        };
    }, []);

    return { statuses, error };
};
