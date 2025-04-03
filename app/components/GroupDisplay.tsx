// app/components/GroupDisplay.tsx
import React from "react";
import { useGroupUpdates, Group } from "@/hooks/useGroupUpdates";

interface GroupDisplayProps {
    groupId: number;
}

const GroupDisplay: React.FC<GroupDisplayProps> = ({ groupId }) => {
    const { group, error } = useGroupUpdates(groupId);

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (!group) {
        return <div>Loading group data...</div>;
    }

    return (
        <div className="group-container">
            <h2>{group.groupName}</h2>
            <p>{group.description}</p>
            <p>
                Admin: {group.admin.username} {/* You can also display admin's status if needed */}
            </p>
            <h3>Members:</h3>
            <ul>
                {group.members.map((member) => (
                    <li key={member.userId}>
                        {member.username} -{" "}
                        <span
                            className={`status-indicator ${
                                member.status === "available"
                                    ? "green"
                                    : member.status === "busy"
                                        ? "red"
                                        : "grey"
                            }`}
                        >
              {member.status}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GroupDisplay;
