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
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [loggedInUserGroupIds, setLoggedInUserGroupIds] = useState<
    string[] | null
  >(null);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("id");
      const id = uid ? String(uid) : null;

      if (!token || !id) return;

      try {
        const user = await apiService.get<User>(`/users/${id}`);

        const storedToken = String(token).replace(/\s+/g, "").trim();
        const fetchedToken = user.token
          ? String(user.token).replace(/\s+/g, "").trim()
          : "";
        const wrappedFetchedToken = `"${fetchedToken}"`;
        console.log("Fetched User:", user);
        console.log("Fetched Token from User:", fetchedToken);
        console.log("Stored Token in localStorage:", storedToken);
        console.log("Stored User ID in localStorage:", id);
        console.log("Wrapped Fetched Token:", wrappedFetchedToken);

        if (storedToken == wrappedFetchedToken) {
          setLoggedInUserId(user.id);
          setLoggedInUserGroupIds(user.groupIds); // store the group IDs in order to be able to display the listed ones
        } else {
          console.warn("No matching user found for stored token");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchLoggedInUser();
  }, [apiService]);

  const handleLogout = async () => {
    try {
      await apiService.post<void>(`/users/${loggedInUserId}/logout`, {});
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong while logging out:\n${error.message}`);
      } else {
        console.error("Logout has failed");
      }
    }

    clearToken();
    router.push("/login");
  };

  // fetching all groups, and check if the group id is in the list of group id's that the user is a member of.
  const [userGroupMemberships, setUserGroupMemberships] = useState<Group[]>([]);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const allGroups: Group[] = await apiService.get<Group[]>("/groups");

        if (loggedInUserGroupIds) {
          const filteredGroups = allGroups.filter(
            (group) =>
              group.id !== null && loggedInUserGroupIds.includes(group.id),
          );
          setUserGroupMemberships(filteredGroups);
        }
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
  }, [apiService, loggedInUserGroupIds]);

  return (
    <>
      <div className="dashboardMainPage-container">
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
            {userGroupMemberships && userGroupMemberships.length > 0 ? (
              <>
                {userGroupMemberships.map((group) => (
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
          onClick={() => router.push(`/edit/${loggedInUserId}`)}
        >
          Profile
        </Button>
        <Button className="dashboardMainPage-button" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </>
  );
};

export default Dashboard;
