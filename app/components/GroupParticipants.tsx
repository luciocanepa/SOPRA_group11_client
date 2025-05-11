// components/GroupParticipants.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Table, Tag } from "antd";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  useGroupParticipants,
  Participant,
  TimerInfo,
} from "@/hooks/useGroupParticipants";
import "@/styles/components/GroupParticipants.css";
interface GroupParticipantsProps {
  groupId: string;
  adminId?: string | number | null;
}

export function GroupParticipants({
  groupId,
  adminId,
}: GroupParticipantsProps) {
  const { value: token } = useLocalStorage<string>("token", "");
  const { participants, timers, loading, error } = useGroupParticipants(
    groupId,
    token,
  );

  // tick for countdown
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Format remaining time, pausing when not running
  const formatRemaining = (timer: TimerInfo, status: Participant['status'] )=> {
    if (status === 'ONLINE' || status === 'OFFLINE') {
      return '—';
    }
    if (!timer.running) {
      // paused: show static remaining
      const m = Math.floor(timer.duration / 60)
        .toString()
        .padStart(2, "0");
      const s = (timer.duration % 60).toString().padStart(2, "0");
      return `${m}:${s}`;
    }
    // running: calculate countdown
    const end = timer.start.getTime() + timer.duration * 1000;
    const secs = Math.max(0, Math.ceil((end - now) / 1000));
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const data = participants.map((user) => {
    const timer = timers[user.id];
    return {
      ...user,
      timeRemaining: timer ? formatRemaining(timer, user.status) : '—'
    };
  });

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username: string, record: Participant) =>
        record.id === adminId ? `${username} (admin)` : username,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: Participant["status"]) => {
        let color = "purple";
        if (status === "ONLINE") color = "green";
        else if (status === "WORK") color = "red";
        else if (status === "BREAK") color = "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Time Remaining",
      dataIndex: "timeRemaining",
      key: "timeRemaining",
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
          rowKey="id"
          loading={loading}
          pagination={false}
          // scroll={{ y: "calc(45vh - 150px)" }}
          sticky={true}
        />
      )}
    </div>
  );
}
