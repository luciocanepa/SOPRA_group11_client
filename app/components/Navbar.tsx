import "@/styles/components/Navbar.css";
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

export default function Navbar() {
  const apiService = useApi();
  const router = useRouter();

  const { value: token, clear: clearToken } = useLocalStorage<string>("token", "");
  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await apiService.get(`/users/${id}`, token);
      setUser(user as User);
    };
    fetchUser();
  }, [id, token, apiService]);

  const handleLogout = async () => {
    if (!user) return;
    try {
      await apiService.post<void>(
        `/users/${user.id}/logout`,
        {},
        token,
      );
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong while logging out:\n${error.message}`);
      } else {
        console.error("Logout has failed");
      }
    }

    clearToken();
    clearId();
    router.push("/login");
  };

  return (
    <div className="navbar-container">
      {user?.profilePicture && (
        <Image
          src={`data:image/png;base64,${user?.profilePicture}`}
          alt="Profile"
          id="navbar-profile-picture"
          width={40}
          height={40}
        />
      )}
      <h1>{user?.name || user?.username}</h1>
      
      <div className="navbar-container-right">
        <Button
                className="navbar-button"
                id="navbar-profile-button"
                onClick={() => router.push(`/edit/${user?.id}`)}
            >
                Edit profile
            </Button>
            <Button
                className="navbar-button"
                id="navbar-logout-button"
                onClick={handleLogout}
            >
                Logout
            </Button>
      </div>
    </div>
  );
}