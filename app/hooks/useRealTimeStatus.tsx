// app/hooks/useRealTimeStatus.tsx
import { useState, useEffect } from "react";
import { User } from "@/types/user"; // Import User type

export const useRealTimeStatus = () => {
    const [statuses, setStatuses] = useState<User[]>([]); // Ensure statuses is typed as User[]
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const gid = "your-group-id"; // Replace with actual group ID
        const socketUrl = `ws://your-websocket-url/groups/${gid}/changeStatus`; //@TODO: update with our websocket URL

        const socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("WebSocket connection established.");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setStatuses(data.statuses); // Assuming server sends updated statuses
            } catch (error) {
                setError("Failed to parse WebSocket data");
                console.error("WebSocket message error:", error);
            }
        };

        socket.onerror = (err) => {
            setError("Failed to connect to the WebSocket.");
            console.error("WebSocket error:", err);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed.");
        };

        return () => {
            socket.close();
        };
    }, []);

    return { statuses, error };
};
