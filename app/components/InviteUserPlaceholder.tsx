"use client";

import { useState } from "react";
import { Button, Modal } from "antd";

export function InviteUserPlaceholder() {
  const [open, setOpen] = useState(false);

  return (
    <div className="invite-user-placeholder-container">
      <Button className="invite-user-button" onClick={() => setOpen(true)}>
        + Invite User
      </Button>
      <Modal
        title="Invite Group Member"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        className="invite-user-modal"
      >
        <p>This feature is coming soon!</p>
        {/* In the future: replace with <InviteUserForm groupId={...} /> */}
      </Modal>
    </div>
  );
}
