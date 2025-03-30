"use client";

import { useApi } from "@/hooks/useApi";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Table, Tag } from "antd";


interface Participant {
    id: number;
    username: string;
    status: 'Available' | 'Working' | 'Offline';
}

export default function GroupParticipantsPage() {
    const params = useParams();
    const gId = params.gId as string;
    const apiService = useApi();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                setLoading(true);
                const response = await apiService.get(`/groups/${gId}`);

                const members = response.users.map((user: any) => ({
                    id: user.id,
                    username: user.username,
                    status: user.status
                }));

                setParticipants(members);
            } catch (error) {
                console.error("Failed to fetch participants:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [gId]);

    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'Available' | 'Working' | 'Offline') => (
                <Tag color={status === 'Available' ? 'green' : 'red'}>
                    {status}
                </Tag>
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