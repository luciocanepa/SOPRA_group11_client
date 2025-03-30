"use client";
import "@/styles/pages/dashboard.css";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Group } from "@/types/group";
import { Button, Card, Table } from "antd";
import React, { useEffect, useState } from "react";
import { PlusCircleOutlined } from "@ant-design/icons";



const Dashboard: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const {
        clear: clearToken,
    } = useLocalStorage<string>("token", "");

    const handleLogout = (): void => {
        clearToken();
        router.push("/login");
    };


    const columns = [
        {
          title: "Group Name",
          dataIndex: "groupName",
          key: "groupName",
        }
      ];


      // in order to get the current user, to be able to filter the groups the user is member of
      const [loggedInUser, setLoggedInUser] = useState<string | null>(null);
      useEffect(() => {
          const fetchLoggedUserId = localStorage.getItem("locallyStoredID");
          if (fetchLoggedUserId) {
              setLoggedInUser(fetchLoggedUserId);
          } else {
              console.log("No user ID found in local storage.");
          }
      }, []);


      // fetches all the groups, and checks for each group if the current user is a member
    const [groups, setGroups] = useState<Group[] | null>(null);
    const [userGroups, setUserGroups] = useState<Group[]>([]);
    useEffect(() => {
        const fetchGroups = async () => {
        try {
            const allGroups: Group[] = await apiService.get<Group[]>("/groups");
            setGroups(allGroups);
            console.log("Fetched groups:", groups);


            if (loggedInUser) {
                const filteredGroups = allGroups.filter(group => 
                    group.members?.some(member => member.id === loggedInUser)
                );
                setUserGroups(filteredGroups);
            }

        
        } catch (error) {
            if (error instanceof Error) {
            alert(`Something went wrong while fetching groups:\n${error.message}`);
            } else {
            console.error("An unknown error occurred while fetching groups.");
            }
        }
        };

    fetchGroups();
  }, [apiService, loggedInUser]);





return (
    <>
        <div className="dashboardMainPage-container">
            <Card className="dashboardMainPage-card">
                <div className="dashboardMainPage-button-container">
                    <Button className="dashboardMainPage-button" onClick = {() => router.push("/statistics")}>
                        Statistics
                    </Button>
                    <Button className="dashboardMainPage-button" onClick = {() => router.push("/timer")}>
                        Pomodoro Timer
                    </Button>
                </div>
            </Card>


            <Card className="dashboardMainPage-card">
                <h3>Your Groups:</h3>
                <div className="groups-grid">
                    {userGroups && userGroups.length > 0 ? (
                        <>
                            {userGroups.map((group) => (
                                <div key={group.id} className="group-card-wrapper">
                                    <Card className="group-card" onClick={() => router.push(`/groups/${group.id}`)}>
                                        {group.name}
                                    </Card>
                                </div>
                            ))}
                            <div className="group-card-wrapper">
                                <Card className="group-card" onClick={() => router.push("/groups")}>
                                    <div className="create-group-aligning">
                                        <PlusCircleOutlined className="plus-icon" />
                                        <span>Create New Group</span>
                                    </div>
                                </Card>
                            </div>
                        </>
                    ) : (

                        <div className="group-card-wrapper">
                               <Card className="group-card" onClick={() => router.push("/groups")}>
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
            <Button className="dashboardMainPage-button" onClick = {() => router.push("/edit")}>
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