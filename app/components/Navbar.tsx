import "@/styles/components/Navbar.css";
import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Group } from "@/types/group";

export default function Navbar({
  user,
  group,
}: {
  user: User | null;
  group: Group | null;
}) {
  const apiService = useApi();
  const router = useRouter();

  const { value: token, clear: clearToken } = useLocalStorage<string>(
    "token",
    "",
  );
  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");

  const [loggedInUser, setLoggedInUser] = useState<User | null>(user);
  const [activeGroup, setActiveGroup] = useState<Group | null>(group);

  useEffect(() => {
    if (!id || !token || user) return;
    const fetchUser = async () => {
      const fetchedUser = await apiService.get(`/users/${id}`, token);
      setLoggedInUser(fetchedUser as User);
    };
    fetchUser();
  }, [id, token, apiService, user]);

  useEffect(() => {
    if (!id || !token || !group) return;
    const fetchGroup = async () => {
      const fetchedGroup = await apiService.get(`/groups/${group.id}`, token);
      setActiveGroup(fetchedGroup as Group);
    };
    fetchGroup();
  }, [group, token, apiService, id]);

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
      {activeGroup && (
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
      )}
      {loggedInUser && !activeGroup && (
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
          <h1>{loggedInUser?.name || loggedInUser?.username}</h1>
        </>
      )}

      <div className="navbar-container-right">
        <Button
          className="navbar-button"
          id="navbar-profile-button"
          onClick={() => router.push(`/edit/${loggedInUser?.id}`)}
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
