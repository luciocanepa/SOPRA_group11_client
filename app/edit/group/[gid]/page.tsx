
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Group } from "@/types/group";
import { Button, Form, Input, message, Upload, Select} from "antd";
import { EditOutlined, UploadOutlined} from "@ant-design/icons";
import "@/styles/pages/edit.css";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";


const ManageGroup: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { value: token } = useLocalStorage<string>("token", "");
  const { value: id } = useLocalStorage<string>("id", "");
  const [group, setGroup] = useState<Group | null>(null);
  const { gid } = useParams();
  const [isAuthorizedToEdit, setIsAuthorizedToEdit] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");


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
      message.error(`${file.name} upload failed.`);
      console.error("Upload error:", error);
    };
  };

  useEffect(() => {
    if (!gid || !token || !id) return;

    console.log("checkpoint1")
    const fetchingGroup = async () => {
      try {
        const group = await apiService.get<Group>(`/groups/${gid}`, token);
        setGroup(group);
        console.log("id:" , id)
        console.log("admin id:" , group?.adminId)
        if (id === group.adminId) {
          setIsAuthorizedToEdit(true);
        } else {
          message.error("You are not authorized to edit this profile.");
        }

        if (group.image) {
          setUploadedImage(group.image);
        }
        form.setFieldsValue({
          description: group.description,
          name: group.name ?? undefined,

        });
      } catch (error) {
        if (error instanceof Error) {
          alert(
            `Something went wrong while fetching the group:\n${error.message}`,
          );
        } else {
          console.error("An unknown error occurred while fetching the group.");
        }
      }
    };

    fetchingGroup();
  }, [gid, token, id, apiService, form]);


  const handleGroupEdit = async () => {
    if (!token) return;
    if (!isAuthorizedToEdit) {
      message.error("You are not authorized to edit this profile.");
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

      message.success("Group updated successfully");
      setIsEdit({
        description: false,
        name: false,
      });
      alert("Edit successful!");
      router.push(`/edit/group/${group?.id}`);
    } catch (error) {
      message.error("Failed to update the group.");
      console.error(error);
    }
  };

  const handleGroupDeletion = async () => {
    const confirmDelete = window.confirm("Do you really want to delete your group?");
    if (!confirmDelete) return;

    try {
      await apiService.delete(`/groups/${gid}`, token)

      alert("Successful Deletion of your group!");
      router.push(`/dashboard`);
    } catch (error) {
      message.error("Failed to delete the group.");
      console.error(error);
    }
  }

  const handleUserRemoval = async (userId: string) => {
    if (!token || !group || !group.id || !group.users) return;
    console.log("group.users", group.users);
    console.log("to delete", userId);
    const userToRemove = group.users.find((user) => String(user.id) === String(userId));
    console.log("userToRemove:" , userToRemove);
    if (!userToRemove) return;
  
    const confirmRemoval = window.confirm(`Are you sure you want to remove ${userToRemove.username} from the group?`);
    if (!confirmRemoval) return;
  
    try {
      await apiService.delete(`/groups/${group.id}/${userId}`, token);
  
      const updatedUsers = group.users.filter((user) => user.id !== userId);
      const updatedGroup = { ...group, users: updatedUsers };
      setGroup(updatedGroup);
  
      message.success(`User ${userToRemove.username} has been removed from the group.`);
      alert(`The removal of ${userToRemove.username} was successful!`);
      router.push(`/edit/group/${gid}`);
    } catch (error) {
      message.error("Failed to remove member.");
      console.error(error);
    }
  };
  



  return (
    <div className="background-container">
      <div className="groupCreation-container">
        <Form
          form={form}
          name="profile management"
          size="large"
          variant="outlined"
          onFinish={handleGroupEdit}
          layout="vertical"
        >
          <h2>Group Management</h2>

          <div className="profile-image-container">
            <Image
              src={
                uploadedImage
                  ? `data:image/png;base64,${uploadedImage}`
                  : "/group_tomato.JPG"
              }
              alt="Profile"
              className="profile-image"
              width={150}
              height={150}
              unoptimized={!!uploadedImage}
            />
          </div>


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
                  onClick={() => setIsEdit((prev) => ({ ...prev, description: true }))}
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
              <Button
                className="groupCreation-upload"
                icon={<UploadOutlined />}
              >
                Upload Group Picture
              </Button>
            </Upload>
          </Form.Item>


          <Form.Item>
            <Button htmlType="submit" className="groupCreation-button">
              Save Group Changes
            </Button>
          </Form.Item>


          <Form.Item label="Remove Member From Group">
            <Select
              placeholder="Select a member to remove"
              className="removal-dropdown"
              onChange={(userId) => handleUserRemoval(userId)}
              allowClear
            >
              {group?.users?.map((user) => (
              <Select.Option key={user.id} value={user.id}>
                {user.username}
              </Select.Option>
              ))}
            </Select>
          </Form.Item>


          <Form.Item>
            <Button
              className="groupCreation-button"
              onClick={handleGroupDeletion}
            >
              Delete your Group
            </Button>
          </Form.Item>
          

          <Form.Item>
            <Button
              className="groupCreation-button"
              onClick={() => router.push(`/groups/${gid}`)}
            >
              Back to Group Dashboard
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ManageGroup;

