"use client";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Group } from "@/types/group";
import { User } from "@/types/user";
import { Button, Card } from "antd";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import "../styles/pages/dashboard.css";

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

      // Remove from previously notified IDs
      const notifiedIds = JSON.parse(
        localStorage.getItem("notifiedInvitations") || "[]",
      );
      localStorage.setItem(
        "notifiedInvitations",
        JSON.stringify(notifiedIds.filter((id: number) => id !== invitationId)),
      );
      fetchGroups();
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

      // Remove from previously notified IDs
      const notifiedIds = JSON.parse(
        localStorage.getItem("notifiedInvitations") || "[]",
      );
      localStorage.setItem(
        "notifiedInvitations",
        JSON.stringify(notifiedIds.filter((id: number) => id !== invitationId)),
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

  useEffect(() => {
    fetchGroups();
  }, [apiService, token, id]);

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!token || !id) return;

      try {
        const fetchedInvitations: Invitation[] = await apiService.get<
          Invitation[]
        >(`/users/${id}/invitations`, token);

        // Here we load previously notified IDs from localStorage (so we dont get notified for things we've seen already)
        const notifiedIds: number[] = JSON.parse(
          localStorage.getItem("notifiedInvitationIds") || "[]",
        );

        const newInvitations = fetchedInvitations.filter(
          (inv) => !notifiedIds.includes(inv.id),
        );

        // notification for each -new- invitation
        newInvitations.forEach((inv) => {
          if (Notification.permission === "granted") {
            new Notification("New Group Invitation", {
              body: `You've been invited to join "${inv.groupName}".`,
              icon: "/tomato_guy.png",
            });
          }
        });

        // Here the state and the localStorage get updated with all seen invitation IDs
        setInvitations(fetchedInvitations);
        const updatedIds = [
          ...new Set([
            ...notifiedIds,
            ...fetchedInvitations.map((inv) => inv.id),
          ]),
        ];
        localStorage.setItem(
          "notifiedInvitationIds",
          JSON.stringify(updatedIds),
        );
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
              <div>
                {invitations.map((invitation) => (
                  <Card
                    key={invitation.id}
                    className="line-card invitation-card"
                  >
                    <p>{invitation.groupName}</p>
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
                ))}
              </div>
            </>
          )}
          <h3>Your Groups:</h3>
          <div>
            {loggedInUserGroups && loggedInUserGroups.length > 0 ? (
              <>
                {loggedInUserGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="line-card"
                    onClick={() => router.push(`/groups/${group.id}`)}
                  >
                    {group?.image && (
                      <Image
                        className="group-image"
                        src={`data:image/png;base64,${group?.image}`}
                        alt="Profile"
                        width={40}
                        height={40}
                      />
                    )}
                    {!group?.image && (
                      <Image
                        className="group-image"
                        src={"/group_tomato.JPG"}
                        alt="Profile"
                        width={40}
                        height={40}
                      />
                    )}
                    <p id="group-name">{group.name}</p>
                    <p id="group-description">{group.description}</p>
                  </Card>
                ))}
                <Card
                  className="line-card"
                  onClick={() => router.push("/groups")}
                >
                  <div className="group-name">+ Create New Group </div>
                </Card>
              </>
            ) : (
              <Card
                className="line-card"
                onClick={() => router.push("/groups")}
              >
                <div className="group-name">+ Create New Group </div>
              </Card>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
