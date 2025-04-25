"use client";

import { useState } from "react";
import { Button, Modal } from "antd";
import "@/styles/pages/group_dashboard.css";

export function InviteUserPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <div className="123">
      <Button className="groupPage-button" onClick={() => setOpen(true)}>
        + Invite User
      </Button>
      <Modal
        title="Invite Group Member"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        className="groupPage-button"
      >
        <p>This feature is coming soon!</p>
        {/* In the future: replace with <InviteUserForm groupId={...} /> */}
      </Modal>
    </div>
  );
}
