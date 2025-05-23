"use client";

import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Table, Tag } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
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

export default function GroupParticipantsPage() {
  const params = useParams();
  const gId = params.gId as string;
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
          `/groups/${gId}`,
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
  }, [gId, apiService, token]);

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
      render: (status: "Available" | "Working" | "Offline") => (
        <Tag color={status === "Available" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Group Members</h2>
      <Table
        columns={columns}
        dataSource={participants}
        loading={loading}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </div>
  );
}
