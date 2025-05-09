"use client";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Button, Card } from "antd";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";

import "../styles/pages/Dashboard.css";

interface Invitation {
  id: number;
  groupId: number;
  groupName: string;
  inviterId: number;
  inviteeId: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  invitedAt: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<string>("id", "");

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [loggedInUserGroups, setLoggedInUserGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  const handleAcceptInvitation = async (invitationId: number) => {
    if (!token || !id) return;

    try {
      await apiService.put<void>(
        `/invitations/${invitationId}/accept`,
        {},
        token,
      );
      setInvitations(
        invitations.filter((invitation) => invitation.id !== invitationId),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error accepting invitation:", error.message);
      } else {
        console.error("An unknown error occurred while accepting invitation.");
      }
    }
  };

  const handleDeclineInvitation = async (invitationId: number) => {
    if (!token || !id) return;

    try {
      await apiService.put<void>(
        `/invitations/${invitationId}/reject`,
        {},
        token,
      );
      setInvitations(
        invitations.filter((invitation) => invitation.id !== invitationId),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error declining invitation:", error.message);
      } else {
        console.error("An unknown error occurred while declining invitation.");
      }
    }
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

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!token || !id) return;

      try {
        const invitations: Invitation[] = await apiService.get<Invitation[]>(
          `/users/${id}/invitations`,
          token,
        );
        setInvitations(invitations);
        console.log("Invitations:", invitations);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching invitations:", error.message);
        } else {
          console.error(
            "An unknown error occurred while fetching invitations.",
          );
        }
      }
    };

    fetchInvitations();
  }, [apiService, token, id]);

  return (
    <>
      <Navbar user={loggedInUser} />
      <div className="page-container">
        <Card className="card dashboard-card">
          <div className="dashboard-button-container">
            <Button
              className="button secondary"
              onClick={() => router.push("/statistics")}
            >
              Statistics
            </Button>
            <Button
              className="button secondary"
              onClick={() => router.push("/timer")}
            >
              Pomodoro Timer
            </Button>
          </div>
        </Card>

        <Card className="card dashboard-card">
          {invitations.length > 0 && (
            <>
              <h3>Your invitations:</h3>
              <div className="dashboard-grid">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="card-wrapper invitation-card-wrapper"
                  >
                    <Card className="line-card">
                      {invitation.groupName}
                      <div className="invitation-card-button-container">
                        <Button
                          id="accept"
                          className="green"
                          onClick={() => handleAcceptInvitation(invitation.id)}
                        >
                          Accept
                        </Button>

                        <Button
                          id="reject"
                          className="red"
                          onClick={() => handleDeclineInvitation(invitation.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </Card>
                  </div>
                  // <div key={invitation.id} className="invitation-card-wrapper">
                  //   <a className="invitation-card">{invitation.groupName}</a>
                  //   <button
                  //     id="accept"
                  //     onClick={() => handleAcceptInvitation(invitation.id)}
                  //   >
                  //     Accept
                  //   </button>
                  //   <button
                  //     id="reject"
                  //     onClick={() => handleDeclineInvitation(invitation.id)}
                  //   >
                  //     Decline
                  //   </button>
                  // </div>
                ))}
              </div>
            </>
          )}
          <h3>Your Groups:</h3>
          <div className="dashboard-grid">
            {loggedInUserGroups && loggedInUserGroups.length > 0 ? (
              <>
                {loggedInUserGroups.map((group) => (
                  <div key={group.id} className="card-wrapper">
                    <Card
                      className="line-card"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      {group.name}
                    </Card>
                  </div>
                ))}
                <div className="card-wrapper">
                  <Card
                    className="line-card"
                    onClick={() => router.push("/groups")}
                  >
                    <div className="create-group-aligning">
                      <span>+ Create New Group</span>
                    </div>
                  </Card>
                </div>
              </>
            ) : (
              <div className="card-wrapper">
                <Card
                  className="line-card"
                  onClick={() => router.push("/groups")}
                >
                  <div className="create-group-aligning">
                    <span>+ Create New Group</span>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
