"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, Upload } from "antd";
import { User } from "@/types/user";
import { Group } from "@/types/group";
import { UploadOutlined } from "@ant-design/icons";
import useLocalStorage from "@/hooks/useLocalStorage";
import { InviteUser } from "@/components/InviteUser";
import Navbar from "@/components/Navbar";
import "@/styles/pages/GroupCreation.css";
import toast from "react-hot-toast";

interface FormFieldProps {
  name: string;
  description: string;
  image: string;
}

const GroupCreation: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<string>("id", "");

  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [invitedUsers, setInvitedUsers] = useState<
    { id: string; username: string }[]
  >([]);

  const [buttonEnabled, setButtonEnabled] = useState<boolean>(true);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      if (!token || !id) return;

      try {
        const user = await apiService.get<User>(`/users/${id}`, token);
        setLoggedInUser(user);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(
            <div>
              <strong>Failed to fetch user:</strong>
              <div>{error.message}</div>
            </div>,
          );
        } else {
          console.error("An unknown error occurred while fetching groups.");
        }
      }
    };

    fetchLoggedInUser();
  }, [apiService, token, id]);

  const handleGroupCreation = async (values: FormFieldProps) => {
    if (!token || !buttonEnabled) return;
    setButtonEnabled(false);
    try {
      const requestBody = {
        ...values,
        members: invitedUsers.map((user) => user.id),
        image: uploadedImage || null,
        adminId: loggedInUser?.id,
      };

      const newGroup = await apiService.post<Group>(
        "/groups",
        requestBody,
        token,
      );

      for (const user of invitedUsers) {
        await apiService.post(
          `/groups/${newGroup.id}/invitations`,
          { inviteeId: user.id },
          token,
        );
      }

      toast.success(
        <div>
          <strong>Group created successfully!</strong>
          <div>Redirecting to Group Dashboard</div>
        </div>,
      );
      localStorage.setItem("justReset", "true");
      setTimeout(() => {
        router.push(`/groups/${newGroup.id}`);
      }, 800);
    } catch (error) {
      setButtonEnabled(true);
      if (error instanceof Error) {
        toast.error(
          <div>
            <strong>Group creation failed:</strong>
            <div>{error.message}</div>
          </div>,
        );
      } else {
        toast.error(
          <div>
            <strong>Group creation failed:</strong>
            <div>Unknown error</div>
          </div>,
        );
      }
    }
  };

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const uploadingImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setUploadedImage(base64String);
    };

    reader.onerror = (error) => {
      toast.error(
        <div>
          <strong>Upload failed:</strong>
          <div>{file.name} could not be uploaded.</div>
        </div>,
      );
      console.error("Upload error:", error);
    };
  };

  return (
    <div className="page-container">
      <Navbar user={loggedInUser} />

      <div className="form-container">
        <Form
          form={form}
          name="group creation"
          // size="large"
          variant="outlined"
          onFinish={handleGroupCreation}
          layout="vertical"
          className="form"
        >
          <h2>Create Study Group</h2>
          <Form.Item
            name="name"
            label="Group name"
            rules={[
              {
                required: true,
                message: "Please input a groupname for your group!",
              },
            ]}
          >
            <Input type="name" placeholder="Enter a groupname" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: false,
                message: "Please input a description for your group",
              },
            ]}
          >
            <Input
              type="description"
              placeholder="Enter a description for your group"
            />
          </Form.Item>
          <Form.Item>
            <p>Invite Users</p>
            <InviteUser
              group={null}
              isVisible={true}
              onInviteLocally={(user) => {
                setInvitedUsers((prev) => {
                  if (prev.find((u) => u.id === user.id)) return prev;
                  return [...prev, user];
                });
              }}
            />
          </Form.Item>

          <Form.Item name="image" label="Group Picture">
            <Upload
              name="logo"
              listType="picture"
              beforeUpload={(file) => {
                uploadingImage(file);
                return false;
              }}
            >
              <Button className="secondary" icon={<UploadOutlined />}>
                Upload Group Picture
              </Button>
            </Upload>
          </Form.Item>

          <div
            className={`form-final-button-container ${buttonEnabled ? "" : "disabled"}`}
          >
            <Form.Item>
              <Button htmlType="submit" className="green">
                Create Group
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                className="red"
                id="group-creation-cancel-button"
                onClick={() => router.push("/dashboard")}
              >
                Cancel
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default GroupCreation;
