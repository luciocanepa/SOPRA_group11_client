"use client";

import { useState, useEffect } from "react";
import { AutoComplete, Form, Button, message } from "antd";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import "@/styles/pages/inviteUser.css";
interface InviteUserProps {
    groupId?: string; // optional for local
    isVisible: boolean;
    onInviteLocally?: (user: User) => void; // callback for local-only use
}

interface User {
    id: string;
    username: string;
}

export function InviteUser({ groupId, isVisible, onInviteLocally }: InviteUserProps) {
    const apiService = useApi();
    const { value: token } = useLocalStorage<string>("token", "");
    const { value: localUserId } = useLocalStorage<string>("id", "");
    
    const [username, setUsername] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<{ value: string }[]>([]);
    const [allUsers, setAllUsers] = useState<{ id: string; username: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [inviteResults, setInviteResults] = useState<{ username: string; status: "success" | "error" | "not_found"; message: string }[]>([]);

    // Fetch all users on component mount
    useEffect(() => {
        if (!token) return;
        const fetchUsers = async () => {
            try {
                const users = await apiService.get<User[]>("/users", token);
                const filteredUsers = users.filter(user => user.id !== (localUserId || ""));
                setAllUsers(filteredUsers);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, [apiService, token, localUserId]);

    useEffect(() => {
        if (isVisible) {
            setInviteResults([]); // Clear the table when modal opens
        }
    }, [isVisible]);

    // Filter options as the user types
    const handleSearch = (searchText: string) => {
        setUsername(searchText);
        const matches = allUsers
            .filter(user =>
                user.username.toLowerCase().includes(searchText.toLowerCase())
            )
            .map(user => ({ value: user.username }));

        setFilteredOptions(matches);
    };

    // Check if the username exists
    const getUserByUsername = (username: string) => {
        return allUsers.find(user =>
            user.username.toLowerCase() === username.toLowerCase()
        );
    };

    const handleInvite = async () => {
        const matchingUser = getUserByUsername(username);

        if (!matchingUser) {
            // Add an entry with 'not_found' status for the user not existing
            setInviteResults(prev => [
                ...prev,
                { username: username, status: "not_found", message: "User does not exist." }
            ]);
            message.warning("User not found.");
            return;
        }

        if (!groupId && onInviteLocally) {
            // Locally adding user
            onInviteLocally(matchingUser);
            setInviteResults(prev => [
                ...prev,
                { username: matchingUser.username, status: "success", message: "Locally added." }
            ]);
            setUsername("");
            setFilteredOptions([]);
            return;
        }

        try {
            setLoading(true);
            // Send invitation to the selected user
            await apiService.post(
                `/groups/${groupId}/invitations`,
                { inviteeId: matchingUser.id },
                token
            );

            message.success("User invited successfully!");
            setInviteResults(prev => [
                ...prev,
                { username: matchingUser.username, status: "success", message: "Invitation sent." }
            ]);
            setUsername("");
            setFilteredOptions([]);
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : "Unknown error";
            setInviteResults(prev => [
                ...prev,
                { username: matchingUser.username, status: "error", message: `Invitation failed: ${errMsg}` }
            ]);
            message.error(`Invitation failed: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="invite-container">
            <Form
                form={form}
                name="invite-user-form"
                size="large"
                layout="vertical"
                onFinish={handleInvite}
            >
                <Form.Item
                    name="username"
                    label="Invite a User"
                    rules={[{ required: false, message: "Please enter a username!" }]}>
                    <AutoComplete
                        className="w-full"
                        options={filteredOptions}
                        popupClassName="autocomplete-popup"
                        onSearch={handleSearch}
                        onSelect={setUsername}
                        onChange={setUsername}
                        placeholder="Enter username"
                        value={username}
                    />
                </Form.Item>

                <Button
                    className="invite-user-button"
                    onClick={handleInvite}
                    loading={loading}
                    disabled={!username}
                >
                    Send Invitation
                </Button>

                {inviteResults.length > 0 && (
                    <div className="invite-results">
                        <h4>Invitations Sent:</h4>

                        <div className="invite-results-table">
                        {inviteResults.map((res, idx) => (
                            <div key={idx} className="invite-result-row" id={res.status == "success" ? "success": "error"}>
                                <p>{res.username}</p>
                                <p>{res.message}</p>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
            </Form>
        </div>
    );
}
