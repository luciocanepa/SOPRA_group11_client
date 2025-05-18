import { Button, Modal } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

import InfoCarousel from "@/components/Info";
import toast from "react-hot-toast";
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

  const [buttonEnabled, setButtonEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id || !token || user) return;
    const fetchUser = async () => {
      const fetchedUser = await apiService.get(`/users/${id}`, token);
      setLoggedInUser(fetchedUser as User);
    };
    fetchUser();
  }, [id, token, apiService, user]);

  const handleLogout = async () => {
    if (!buttonEnabled) return;
    setButtonEnabled(false);
    console.log("logging out");
    console.log(loggedInUser);
    if (!loggedInUser) return;
    try {
      await apiService.post<void>(
        `/users/${loggedInUser.id}/logout`,
        {},
        token,
      );
      toast.success("Logged out successfully! \n Redirecting to Login Page.");
    } catch (error) {
      setButtonEnabled(true);
      if (error instanceof Error) {
        // alert(`Something went wrong while logging out:\n${error.message}`);
        toast.error(`Logout failed: ${error.message}`);
      } else {
        // console.error("Logout has failed");
        toast.error("Logout failed: Unknown error occurred.");
      }
    }
    clearToken();
    clearId();
    setTimeout(() => {
      router.push("/login");
    }, 800);
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
          <Button
              className="button secondary"
              onClick={() => setIsModalOpen(true)}
              style={{ marginLeft: "18px" }}
          >
            Info
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
            {!loggedInUser?.profilePicture && (
              <img
                src={"/tomato.JPG"}
                alt="Profile"
                id="navbar-profile-picture"
              />
            )}
            <h3>{loggedInUser?.name || loggedInUser?.username}</h3>
          </>
        )}

        <div className={`navbar-button-container ${buttonEnabled ? "" : "disabled"}`}>
          <Button
            className="button secondary"
            id="navbar-profile-button"
            onClick={() => router.push(`/users/${loggedInUser?.id}/edit`)}
          >
            Edit profile
          </Button>
          <Button className="red" onClick={handleLogout} disabled={!buttonEnabled}>
            Logout
          </Button>
        </div>
      </div>

      <Modal
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={600}
          centered
          styles={{
            body: {
              padding: "1.5rem",
              height: "380px",
              overflowY: "auto",
            },
          }}
          destroyOnClose
      >
        <InfoCarousel />
      </Modal>
    </div>
  );
}
