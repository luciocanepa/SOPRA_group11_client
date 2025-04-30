"use client";

import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import "@/styles/pages/participants.css";

interface ApiUser {
  id: number;
  username: string;
  status: "Available" | "Working" | "Offline";
}

interface GroupResponse {
  users: ApiUser[];
}

interface Participant {
  id: number;
  username: string;
  status: "Available" | "Working" | "Offline";
}

interface GroupParticipantsProps {
  groupId: string;
}

export function GroupParticipants({ groupId }: GroupParticipantsProps) {
  const apiService = useApi();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const { value: token } = useLocalStorage<string>("token", "");

  useEffect(() => {
    if (!token) return;
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await apiService.get<GroupResponse>(
          `/groups/${groupId}`,
          token,
        );

        const members = response.users.map((user: ApiUser) => ({
          id: user.id,
          username: user.username,
          status: user.status,
        }));

        setParticipants(members);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [groupId, apiService, token]);

  // TODO: integrate WebSocket live status updates when ready

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: "ONLINE" | "WORK" | "BREAK" | "OFFLINE") => {
        let color = "white"; // Default color

        // Assign different colors based on the status
        if (status === "ONLINE") {
          color = "green";
        } else if (status === "WORK") {
          color = "red";
        } else if (status === "BREAK") {
          color = "orange";
        } else if (status === "OFFLINE") {
          color = "grey";
        }

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="group-members-container">
      <h2 className="group-members-title">Group Members</h2>
      <Table
        className="group-members-table"
        columns={columns}
        dataSource={participants}
        loading={loading}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
}
