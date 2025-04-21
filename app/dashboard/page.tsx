"use client";
import "@/styles/pages/dashboard.css";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Button, Card } from "antd";
import React, { useEffect, useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { value: token, clear: clearToken } = useLocalStorage<string>(
    "token",
    "",
  );
  const { value: id, clear: clearId } = useLocalStorage<string>("id", "");

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loggedInUserGroups, setLoggedInUserGroups] = useState<Group[]>([]);

  const handleLogout = async () => {
    if (!loggedInUser) return;
    try {
      await apiService.post<void>(
        `/users/${loggedInUser.id}/logout`,
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

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      if (!token || !id) return;

      try {
        const user = await apiService.get<User>(`/users/${id}`, token);
        setLoggedInUser(user);

        // const storedToken = String(token).replace(/\s+/g, "").trim();
        // const fetchedToken = user.token
        //   ? String(user.token).replace(/\s+/g, "").trim()
        //   : "";
        // const wrappedFetchedToken = `"${fetchedToken}"`;
        // console.log("Fetched User:", user);
        // console.log("Fetched Token from User:", fetchedToken);
        // console.log("Stored Token in localStorage:", storedToken);
        // console.log("Stored User ID in localStorage:", id);
        // console.log("Wrapped Fetched Token:", wrappedFetchedToken);

        // if (storedToken == wrappedFetchedToken) {
        //   setLoggedInUserId(user.id);
        //   setLoggedInUserGroupIds(user.groupIds); // store the group IDs in order to be able to display the listed ones
        // } else {
        //   console.warn("No matching user found for stored token");
        // }
      } catch (error) {
        if (error instanceof Error) {
          alert(
            `Something went wrong while fetching groups:\n${error.message}`,
          );
        } else {
          console.error("An unknown error occurred while fetching groups.");
        }
      }
    };

    fetchLoggedInUser();
  }, [apiService, token, id]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!token || !id) return;

      try {
        const allGroups: Group[] = await apiService.get<Group[]>(
          `/users/${id}/groups`,
          token,
        );

        setLoggedInUserGroups(allGroups);
      } catch (error) {
        if (error instanceof Error) {
          alert(
            `Something went wrong while fetching groups:\n${error.message}`,
          );
        } else {
          console.error("An unknown error occurred while fetching groups.");
        }
      }
    };

    fetchGroups();
  }, [apiService, loggedInUserGroups, token, id]);

  return (
    <>
      <div className="dashboardMainPage-container">
        <Card className="dashboardMainPage-card">
          <h3>Welcome, {loggedInUser?.username}!</h3>
        </Card>
        <Card className="dashboardMainPage-card">
          <div className="dashboardMainPage-button-container">
            <Button
              className="dashboardMainPage-button"
              onClick={() => router.push("/statistics")}
            >
              Statistics
            </Button>
            <Button
              className="dashboardMainPage-button"
              onClick={() => router.push("/timer")}
            >
              Pomodoro Timer
            </Button>
          </div>
        </Card>

        <Card className="dashboardMainPage-card">
          <h3>Your Groups:</h3>
          <div className="groups-grid">
            {loggedInUserGroups && loggedInUserGroups.length > 0 ? (
              <>
                {loggedInUserGroups.map((group) => (
                  <div key={group.id} className="group-card-wrapper">
                    <Card
                      className="group-card"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      {group.name}
                    </Card>
                  </div>
                ))}
                <div className="group-card-wrapper">
                  <Card
                    className="group-card"
                    onClick={() => router.push("/groups")}
                  >
                    <div className="create-group-aligning">
                      <PlusCircleOutlined className="plus-icon" />
                      <span>Create New Group</span>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="group-card-wrapper">
                <Card
                  className="group-card"
                  onClick={() => router.push("/groups")}
                >
                  <div className="create-group-aligning">
                    <PlusCircleOutlined className="plus-icon" />
                    <span>Create New Group</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="dashboardMPL-button-container">
        <Button
          className="dashboardMainPage-button"
          onClick={() => router.push(`/edit/${loggedInUser?.id}`)}
        >
          Manage Profile
        </Button>
        <Button className="dashboardMainPage-button" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </>
  );
};

export default Dashboard;
