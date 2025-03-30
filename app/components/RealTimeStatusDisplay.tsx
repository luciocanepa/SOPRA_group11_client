// app/components/RealTimeStatusDisplay.tsx
import { useRealTimeStatus } from "@/hooks/useRealTimeStatus";
import { User } from "@/types/user"; // Ensure the User type is imported

const RealTimeStatusDisplay: React.FC = () => {
    const { statuses, error } = useRealTimeStatus();

    if (error) {
        return <div>Error loading statuses</div>;
    }

    return (
        <div className="status-container">
            {statuses.map((user: User) => (
                <div key={user.id} className="status-card">
                    <div className="avatar">{/* Avatar Here */}</div>
                    <div className="username">{user.username}</div>
                    <div
                        className={`status-indicator ${
                            user.status === "available"
                                ? "green"
                                : user.status === "busy"
                                    ? "red"
                                    : "grey"
                        }`}
                    >
                        {user.status}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RealTimeStatusDisplay;
