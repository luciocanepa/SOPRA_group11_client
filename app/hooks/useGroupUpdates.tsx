// app/hooks/useGroupUpdates.tsx
import { useState, useEffect } from "react";

export interface User {
    userId: number;
    username: string;
    status: string;
    // add more fields if needed
}

export interface Group {
    groupId: number;
    groupName: string;
    description: string;
    admin: User;
    groupPicture?: string;
    members: User[];
}

interface GroupUpdateMessage {
    groupId: number;
    updatedFields: Partial<Omit<Group, "groupId" | "members">> & {
        members?: Partial<User>[];
    };
}

export const useGroupUpdates = (groupId: number) => {
    const [group, setGroup] = useState<Group | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Replace with your actual WebSocket URL
        const socketUrl = `ws://your-websocket-url/groups/${groupId}`;
        const socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("WebSocket connection established for group updates.");
            // If needed, send a SUBSCRIBE message according to your spec:
            // For example:
            socket.send(
                JSON.stringify({
                    method: "SUBSCRIBE",
                    path: `/groups/${groupId}`,
                    payload: null,
                })
            );
        };

        socket.onmessage = (event) => {
            try {
                const data: GroupUpdateMessage = JSON.parse(event.data);
                if (data.groupId !== groupId) return; // Ensure the message is for the correct group

                // Merge updates into the current group state
                setGroup((prevGroup) => {
                    if (!prevGroup) {
                        return {
                            groupId: data.groupId,
                            groupName: data.updatedFields.groupName || "",
                            description: data.updatedFields.description || "",
                            admin: data.updatedFields.admin || { userId: 0, username: "", status: "" }, // Ensure required fields
                            groupPicture: data.updatedFields.groupPicture || "",
                            members: (data.updatedFields.members || []).map((u) => ({
                                userId: u.userId ?? 0, // Ensure userId is never undefined
                                username: u.username || "",
                                status: u.status || "available",
                            })),
                        };
                    }

                    const updatedGroup: Group = {
                        ...prevGroup,
                        ...data.updatedFields,
                        members: prevGroup.members.map((member) => {
                            const update = data.updatedFields.members?.find((u) => u.userId === member.userId);
                            if (update) {
                                return {
                                    ...member,
                                    ...update,
                                    userId: member.userId, // Ensure userId is unchanged and always defined
                                };
                            }
                            return member;
                        }),
                    };

                    return updatedGroup;
                });



            } catch (err) {
                setError("Failed to parse group update data.");
                console.error("WebSocket message error:", err);
            }
        };

        socket.onerror = (err) => {
            setError("WebSocket connection error for group updates.");
            console.error("WebSocket error:", err);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed for group updates.");
        };

        return () => {
            socket.close();
        };
    }, [groupId]);

    return { group, error };
};


// it creates a websocket connection and subscribes to it. When it receives a message, it checks if the group ID matches.
// if not, then it aborts. Then, it checks if prevGroup exists, and if not, it initializes the group with all the attributes.
// if prevGroup exists, then prevGroup gets merged with the updatedFields and the updatedGroup is returned.