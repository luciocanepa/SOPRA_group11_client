import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

import "../styles/module.css";
import "../styles/components/Navbar.css";

export default function Navbar({ user }: { user: User | null }) {
  const apiService = useApi();
  const router = useRouter();

  const { value: token, clear: clearToken } = useLocalStorage<string>(
    "token",
    "",
  );
  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");

  const [loggedInUser, setLoggedInUser] = useState<User | null>(user);

  useEffect(() => {
    if (!id || !token || user) return;
    const fetchUser = async () => {
      const fetchedUser = await apiService.get(`/users/${id}`, token);
      setLoggedInUser(fetchedUser as User);
    };
    fetchUser();
  }, [id, token, apiService, user]);

  const handleLogout = async () => {
    if (!user) return;
    try {
      await apiService.post<void>(`/users/${user.id}/logout`, {}, token);
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
      {/* {activeGroup && (
        <>
          {activeGroup?.image && (
            <Image
              src={`data:image/png;base64,${activeGroup?.image}`}
              alt="Profile"
              id="navbar-profile-picture"
              width={40}
              height={40}
            />
          )}
          {!activeGroup?.image && (
            <Image
              src={"/group_tomato.JPG"}
              alt="Profile"
              id="navbar-profile-picture"
              width={40}
              height={40}
            />
          )}
          <h1>
            {activeGroup?.name} ({loggedInUser?.name || loggedInUser?.username})
          </h1>
        </>
      )} */}
      <div className="navbar-container-left">
        <Button
          className="button secondary"
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </Button>
      </div>
      <div className="navbar-user-container">
        {loggedInUser && (
          <>
            {loggedInUser?.profilePicture && (
              <Image
                src={`data:image/png;base64,${loggedInUser?.profilePicture}`}
                alt="Profile"
                id="navbar-profile-picture"
                width={40}
                height={40}
              />
            )}
            <h3>{loggedInUser?.name || loggedInUser?.username}</h3>
          </>
        )}

        <div className="navbar-button-container">
          <Button
            className="button secondary"
            id="navbar-profile-button"
            onClick={() => router.push(`/edit/${loggedInUser?.id}`)}
          >
            Edit profile
          </Button>
          <Button className="red" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
