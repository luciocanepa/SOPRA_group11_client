"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { Button, Form, Input, Upload, Select } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import Navbar from "@/components/Navbar";
import "@/styles/pages/GroupEdit.css";
import toast from "react-hot-toast";

const ManageGroup: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<string>("id", "");
  const [group, setGroup] = useState<Group | null>(null);
  const { gid } = useParams();
  const [isAuthorizedToEdit, setIsAuthorizedToEdit] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [removedUsers, setRemovedUsers] = useState<User[]>([]);

  const [isEdit, setIsEdit] = useState({
    name: false,
    description: false,
  });

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
          </div>
      );
      console.error("Upload error:", error);
    };
  };

  useEffect(() => {
    if (!gid || !token || !id) return;

    const fetchingGroup = async () => {
      try {
        const group = await apiService.get<Group>(`/groups/${gid}`, token);
        setGroup(group);
        if (id === group?.adminId) {
          setIsAuthorizedToEdit(true);
        } else {
          toast.error(
              <div>
                <strong>Unauthorized:</strong>
                <div>You are not authorized to edit this profile.</div>
              </div>
          );
        }

        if (group.image) {
          setUploadedImage(group.image);
        }
        form.setFieldsValue({
          description: group.description,
          name: group.name ?? undefined,
        });
      } catch (error) {
        toast.error(
            <div>
              <strong>Error fetching group:</strong>
              <div>{error.message || "An unknown error occurred."}</div>
            </div>
        );
      }
    };

    fetchingGroup();
  }, [gid, token, id, apiService, form]);

  const handleGroupEdit = async () => {
  if (!token) return;
  if (!isAuthorizedToEdit) {
      toast.error(
          <div>
              <strong>Unauthorized:</strong>
              <div>You are not authorized to edit this profile.</div>
          </div>
      );
      return;
  }
    try {
      const values = form.getFieldsValue();
      const edits: Partial<Group> = {};

      if (values.description !== group?.description) {
        edits.description = values.description;
      }
      if (values.name !== group?.name) {
        edits.name = values.name;
      }

      if (uploadedImage) {
        edits.image = uploadedImage;
      }

      await apiService.put(`/groups/${gid}`, edits, token);

      toast.success(
          <div>
            <strong>Group updated successfully!</strong>
          </div>
      );
      setIsEdit({
        description: false,
        name: false,
      });

      router.push(`/edit/group/${group?.id}`);
    } catch (error) {
      toast.error(
          <div>
            <strong>Failed to update the group.</strong>
          </div>
      );
      console.error(error);
    }
  };

  const confirmWithToast = (message: string, onConfirm: () => void) => {
    toast.custom((t) => (
        <div className="toast-container">
          <p><strong>{message}</strong></p>
          <div>
            <button
                onClick={() => {
                  onConfirm();
                  toast.dismiss(t.id);
                }}
            >
              Confirm
            </button>
            <button onClick={() => toast.dismiss(t.id)}>Cancel</button>
          </div>
        </div>
    ));

  };

  const handleGroupDeletion = async () => {
    confirmWithToast("Do you really want to delete your group?", async () => {
      try {
        await apiService.delete(`/groups/${gid}`, token);

        toast.success(
            <div>
              <strong>Successful Deletion of your group!</strong>
            </div>
        );

        setTimeout(() => {
          router.push(`/dashboard`);
        }, 800);
      } catch (error) {
        toast.error(
            <div>
              <strong>Failed to delete the group.</strong>
            </div>
        );
        console.error(error);
      }
    });
  };

  const handleUserRemoval = async (userId: string) => {
    if (!token || !group || !group.id || !group.users) return;

    const userToRemove = group.users.find((u) => u.id === userId);
    if (!userToRemove) return;

    confirmWithToast(
        `Are you sure you want to remove ${userToRemove.username} from the group?`,
        async () => {
          try {
            await apiService.delete(`/groups/${group.id}/users/${userId}`, token);
            setRemovedUsers([...removedUsers, userToRemove]);

            const updatedGroup = await apiService.get<Group>(
                `/groups/${group.id}`,
                token
            );
            setGroup(updatedGroup);

            toast.success(
                <div>
                  <strong>User {userToRemove.username} has been removed from the group.</strong>
                </div>
            );
          } catch (error) {
            toast.error(
                <div>
                  <strong>Failed to remove member.</strong>
                  <br />
                  Please try again later.
                </div>
            );
            console.error("Error while removing user:", error);
          }
        }
    );
  };

  return (
      <div className="page-container">
        <Navbar user={null} />
        <div className="form-container">
          <Form
              form={form}
              name="group management"
              size="large"
              variant="outlined"
              onFinish={handleGroupEdit}
              layout="vertical"
              className="form"
          >
            <div className="profile-image-container">
              <Image
                  src={
                    uploadedImage
                        ? `data:image/png;base64,${uploadedImage}`
                        : "/group_tomato.JPG"
                  }
                  alt="Profile"
                  width={150}
                  height={150}
                  unoptimized={!!uploadedImage}
              />
            </div>
            <h2>Group Management</h2>

            <Form.Item
                name="name"
                label="Name"
                rules={[{ required: false, message: "Please input your new group name" }]}
            >
              <Input
                  disabled={!isEdit.name}
                  placeholder="Enter a new group name"
                  suffix={
                    <EditOutlined
                        className="edit-icon"
                        onClick={() => setIsEdit((prev) => ({ ...prev, name: true }))}
                    />
                  }
              />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ required: false, message: "Please describe your group" }]}
            >
              <Input
                  disabled={!isEdit.description}
                  placeholder="Describe your group"
                  suffix={
                    <EditOutlined
                        className="edit-icon"
                        onClick={() =>
                            setIsEdit((prev) => ({ ...prev, description: true }))
                        }
                    />
                  }
              />
            </Form.Item>

            <Form.Item name="profilePicture" label="Group Picture">
              <Upload
                  name="logo"
                  beforeUpload={(file) => {
                    uploadingImage(file);
                    return false;
                  }}
              >
                <Button className="groupCreation-upload" icon={<UploadOutlined />}>
                  Upload Group Picture
                </Button>
              </Upload>
            </Form.Item>

            <div className="form-final-button-container">
              <Form.Item>
                <Button htmlType="submit" className="green">
                  Save
                </Button>
              </Form.Item>

              <Form.Item>
                <Button
                    className="red"
                    onClick={() => router.push(`/groups/${gid}`)}
                >
                  Cancel
                </Button>
              </Form.Item>
            </div>
            <Form.Item label="Remove Member From Group">
              <Select
                  placeholder="Select a member to remove"
                  className="removal-dropdown"
                  value={selectedUserId}
                  onChange={(value) => {
                    handleUserRemoval(value);
                    setSelectedUserId(null);
                  }}
                  allowClear
              >
                {group?.users
                    ?.filter((user) => user.id !== group.adminId)
                    .map((user) => (
                        <Select.Option key={user.id} value={user.id}>
                          {user.username}
                        </Select.Option>
                    ))}
              </Select>
              <div className="removed-users-container">
                {removedUsers.map((user) => (
                    <p key={user.id}>{user.username} successfully removed</p>
                ))}
              </div>
            </Form.Item>

            <Form.Item>
              <Button className="red" onClick={handleGroupDeletion}>
                Delete your Group
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
  );
};

export default ManageGroup;
