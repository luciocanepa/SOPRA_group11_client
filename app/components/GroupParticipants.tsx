'use client';

import { useState, useEffect } from 'react';
import { Table, Tag } from 'antd';
import useLocalStorage from '@/hooks/useLocalStorage';
import '@/styles/pages/participants.css';
import { useGroupParticipants, Participant } from '@/hooks/useGroupParticipants';

interface GroupParticipantsProps {
  groupId: string;
  adminId?: string | number | null;
}

export function GroupParticipants({ groupId, adminId }: GroupParticipantsProps) {
  const { value: token } = useLocalStorage<string>('token', '');
  const { participants, timers, loading, error } = useGroupParticipants(groupId, token);

  // countdown tick
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // format remaining seconds into MM:SS
  const formatRemaining = (start: Date, duration: number) => {
    const end = start.getTime() + duration * 1000;
    const secs = Math.max(0, Math.ceil((end - now) / 1000));
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // merge timers into participants for display
  const data = participants.map((u) => ({
    ...u,
    timeRemaining: timers[u.id]
        ? formatRemaining(timers[u.id].start, timers[u.id].duration)
        : '—',
  }));

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (username: string, record: Participant) =>
          record.id === adminId ? `${username} (admin)` : username,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Participant['status']) => {
        let color = 'grey';
        if (status === 'ONLINE') color = 'green';
        else if (status === 'WORK') color = 'red';
        else if (status === 'BREAK') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Time Remaining',
      dataIndex: 'timeRemaining',
      key: 'timeRemaining',
    },
  ];

  return (
      <div className="group-members-container">
        <h2 className="group-members-title">Group Members</h2>
        {error ? (
            <div className="group-members-error">Error: {error}</div>
        ) : (
            <Table
                className="group-members-table"
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={false}
            />
        )}
      </div>
  );
}
