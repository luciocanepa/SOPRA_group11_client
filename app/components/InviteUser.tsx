"use client";

import { useState, useEffect } from "react";
import { AutoComplete, Button, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";

interface InviteUserProps {
    groupId: string;
}

interface User {
    id: number;
    username: string;
}

export function InviteUser({ groupId }: InviteUserProps) {
    const [username, setUsername] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<{ value: string }[]>([]);
    const [allUsers, setAllUsers] = useState<{ id: number; username: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const apiService = useApi();
    const { value: token } = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");

    // Fetch all users on component mount
    useEffect(() => {
        console.log("1");
        const fetchUsers = async () => {
            try {
                const users = await apiService.get<User[]>("/users", token);
                const filteredUsers = users.filter(user => user.id !== parseInt(localUserId || ""));
                setAllUsers(filteredUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, [apiService, token, localUserId]);

    // Filter options as the user types
    const handleSearch = (searchText: string) => {
        setUsername(searchText);
        const matches = allUsers
            .filter(user =>
                user.username.toLowerCase().includes(searchText.toLowerCase())
            )
            .map(user => ({value: user.username}));

        setFilteredOptions(matches);
    };

    const handleInvite = async () => {
        const matchingUser = allUsers.find(user =>
            user.username.toLowerCase() === username.toLowerCase()
        );

        if (!matchingUser) {
            message.warning("User not found.");
            return;
        }

        try {
            setLoading(true);
            await apiService.post(
                `/groups/${groupId}/invitations`,
                {inviteeId: matchingUser.id},
                token
            );
            message.success("User invited successfully!");
            setUsername("");
            setFilteredOptions([]);
        } catch (error) {
            if (error instanceof Error) {
                message.error(`Invitation failed: ${error.message}`);
            } else {
                message.error("Invitation failed: Unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="background-container">
            <div className="invite-container">
                <h3>Invite a User</h3>
                <AutoComplete
                    className="w-full"
                    options={filteredOptions}
                    style={{
                        width: "100%",
                        backgroundColor: "white",
                        color: "black",
                    }}
                    popupClassName="autocomplete-popup"
                    onSearch={handleSearch}
                    onSelect={setUsername}
                    onChange={setUsername}
                    placeholder="Enter username"
                    value={username}
                />
                <Button
                    className="invite-user-button"
                    onClick={handleInvite}
                    loading={loading}
                    disabled={!username}
                >
                    Send Invitation
                </Button>
            </div>
        </div>
    );
}