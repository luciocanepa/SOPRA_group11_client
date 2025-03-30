// app/components/RealTimeStatusDisplay.tsx
import { useRealTimeStatus } from "@/hooks/useRealTimeStatus"; // Custom hook for status updates
import { User } from "@/types/user"; // Assuming you have a user type with a status property

const RealTimeStatusDisplay: React.FC = () => {
    const { statuses, error } = useRealTimeStatus(); // Custom hook to fetch real-time status

    if (error) {
        return <div>Error loading statuses</div>;
    }

    return (
        <div className="status-container">
            {statuses.map((user: User) => (
                <div key={user.id} className="status-card">
                    <div className="avatar">{/* User Avatar */}</div>
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
