// app/hooks/useRealTimeStatus.tsx
import { useState, useEffect } from "react";

export const useRealTimeStatus = () => {
    const [statuses, setStatuses] = useState([]); // For storing statuses of users
    const [error, setError] = useState<string | null>(null); // Update the type to accept both string and null

    useEffect(() => {
        const socket = new WebSocket("ws://your-websocket-url"); // Insert our own WebSocket URL

        socket.onopen = () => {
            console.log("WebSocket connection established.");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setStatuses(data.statuses); // Assuming server sends updated status in { statuses: [...] }
        };

        socket.onerror = (err) => {
            setError("Failed to connect to the WebSocket."); // Now setError can accept a string
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
