"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Form, Input, Select, Upload, DatePicker } from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import Image from "next/image";
import useLocalStorage from "@/hooks/useLocalStorage";
import dayjs from "dayjs";
import moment from "moment-timezone";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";

const timezones = moment.tz.names();

const ManageProfile: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { value: token } = useLocalStorage<string>("token", "");
  const [user, setUser] = useState<User | null>(null);
  const { id } = useParams();
  const [isAuthorizedToEdit, setIsAuthorizedToEdit] = useState<boolean>(false);

  const [isEdit, setIsEdit] = useState({
    username: false,
    name: false,
    password: false,
    birthday: false,
    timezone: false,
  });

  // const hashPassword = async (password: string) => {
  //   const encoder = new TextEncoder();
  //   const data = encoder.encode(password);
  //   const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  //   return Array.from(new Uint8Array(hashBuffer))
  //     .map((byte) => byte.toString(16).padStart(2, "0"))
  //     .join("");
  // };

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const uploadingImage = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setUploadedImage(base64String);
    };

    reader.onerror = () => {
      toast.error(
          <div>
              <div><strong>Upload failed:</strong></div>
              <div>{file.name} could not be uploaded.</div>
          </div>
      );
    };
  };

  useEffect(() => {
    if (!token) return;
    const fetchingUser = async () => {
      try {
        const user = await apiService.get<User>(`/users/${id}`, token);
        setUser(user);
        if (token === user.token) {
          setIsAuthorizedToEdit(true);
        } else {
          toast.error(
              <div>
                <div><strong>Access Denied:</strong></div>
                <div>You are not authorized to edit this profile.</div>
              </div>
          );
        }
        if (user.profilePicture) {
          setUploadedImage(user.profilePicture);
        }
        form.setFieldsValue({
          username: user.username,
          name: user.name ?? undefined,
          birthday: user.birthday
            ? dayjs(user.birthday, "YYYY-MM-DD").startOf("day")
            : null,
          timezone: user.timezone ?? undefined,
        });
      } catch (error) {
          if (error instanceof Error) {
              toast.error(
                  <div>
                      <div><strong>Failed to fetch user:</strong></div>
                      <div>{error.message}</div>
                  </div>
              );
          } else {
              toast.error(
                  <div>
                      <div><strong>Failed to fetch user:</strong></div>
                      <div>An unknown error occurred.</div>
                  </div>
              );
          }
      }
    };

    fetchingUser();
  }, [id, token, apiService, form]);

  const handleUserEdit = async () => {
    if (!token) return;
    // console.log(form.getFieldsValue());
    if (!isAuthorizedToEdit) {
      // console.log("not authorized");
      toast.error(
          <div>
            <div><strong>Unauthorized:</strong></div>
            <div>You are not authorized to edit this profile.</div>
          </div>
      );
      return;
    }
    try {
      const values = form.getFieldsValue();

      const edits: Partial<User> = {};

      // Check for changes and only include them in the updates object
      if (values.username !== user?.username) {
        edits.username = values.username;
      }
      if (values.name !== user?.name) {
        edits.name = values.name;
      }
      if (values.password) {
        // Include password only if it's provided (new value)
        // const hashedPassword = await hashPassword(values.password);
        edits.password = values.password; // You may want to hash it before sending
      }
      if (values.birthday !== user?.birthday) {
        edits.birthday = dayjs(values.birthday).format("YYYY-MM-DD");
      }
      if (values.timezone !== user?.timezone) {
        edits.timezone = values.timezone;
      }
      if (uploadedImage) {
        edits.profilePicture = uploadedImage;
      }
      // console.log("edits before sending", edits);
      await apiService.put(`/users/${user?.id}`, edits, token);

      toast.success(
          <div>
            <div><strong>Profile updated successfully!</strong></div>
            <div>Your changes have been saved.</div>
          </div>
      );
      setIsEdit({
        username: false,
        name: false,
        password: false,
        birthday: false,
        timezone: false,
      }); // reset editable state
      // toast.success(
      //     <div>
      //       <div><strong>Edit successful!</strong></div>
      //       <div>Redirecting back to your profile.</div>
      //     </div>
      // );
      router.push(`/edit/${user?.id}`);
    } catch (error) {
        console.error(error);
      toast.error(
          <div>
            <div><strong>Profile update failed:</strong></div>
            <div>Username may already be taken.</div>
            <div>Please try a different one.</div>
          </div>
      );
    }
  };

  return (
    <div className="page-container">
      <Navbar user={user} />
      <div className="form-container">
        <Form
          form={form}
          name="profile management"
          size="large"
          variant="outlined"
          onFinish={handleUserEdit}
          layout="vertical"
          className="form"
        >
          <div className="profile-image-container">
            <Image
              src={
                uploadedImage
                  ? `data:image/png;base64,${uploadedImage}`
                  : "/tomato.JPG"
              }
              alt="Profile"
              className="profile-image"
              width={150} // Add appropriate width
              height={150} // Add appropriate height
              unoptimized={!!uploadedImage} // Needed for base64 images
            />
          </div>
          <h2>Profile Management</h2>

          <Form.Item name="username" label="Username">
            <Input
              disabled={!isEdit.username}
              suffix={
                <EditOutlined
                  className="edit-icon"
                  onClick={() =>
                    setIsEdit((prev) => ({ ...prev, username: true }))
                  }
                />
              }
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: false, message: "Please input your Name" }]}
          >
            <Input
              disabled={!isEdit.name}
              placeholder="What's your name?"
              suffix={
                <EditOutlined
                  className="edit-icon"
                  onClick={() => setIsEdit((prev) => ({ ...prev, name: true }))}
                />
              }
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: false, message: "Please input a new Password" },
              {
                min: 8,
                message: "Password must be at least 8 characters long!",
              },
              {
                pattern: /[A-Z]/,
                message: "Password must contain at least one uppercase letter!",
              },
              {
                pattern: /[a-z]/,
                message: "Password must contain at least one lowercase letter!",
              },
              {
                pattern: /\d/,
                message: "Password must contain at least one number!",
              },
              {
                pattern: /[^A-Za-z0-9]/,
                message:
                  "Password must contain at least one special character!",
              },
            ]}
          >
            <Input
              type="password"
              placeholder="Change password"
              disabled={!isEdit.password}
              suffix={
                <EditOutlined
                  className="edit-icon"
                  onClick={() =>
                    setIsEdit((prev) => ({ ...prev, password: true }))
                  }
                />
              }
            />
          </Form.Item>

          <Form.Item label="Birthday">
            {isEdit.birthday ? (
              <Form.Item name="birthday" noStyle>
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  allowClear
                  picker="date"
                />
              </Form.Item>
            ) : (
              <div style={{ position: "relative" }}>
                <Input
                  value={
                    form.getFieldValue("birthday")?.format("YYYY-MM-DD") || ""
                  }
                  readOnly
                  style={{
                    backgroundColor: "#f5f5f5",
                  }}
                />
                {/* Overlay to block interaction and force cursor */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    cursor: "not-allowed",
                    zIndex: 2,
                  }}
                />
                <EditOutlined
                  className="edit-icon"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    zIndex: 3, // make sure it's above the overlay
                  }}
                  onClick={() =>
                    setIsEdit((prev) => ({ ...prev, birthday: true }))
                  }
                />
              </div>
            )}
          </Form.Item>

          <Form.Item name="timezone" label="Timezone">
            <Select
              disabled={!isEdit.timezone}
              placeholder="Select from dropdown menu"
              onChange={(value) => form.setFieldsValue({ timezone: value })}
              suffixIcon={
                <EditOutlined
                  className="edit-icon"
                  onClick={() =>
                    setIsEdit((prev) => ({ ...prev, timezone: true }))
                  }
                />
              }
            >
              {timezones.map((tz) => (
                <Select.Option key={tz} value={tz}>
                  {tz}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="profilePicture" label="Profile Picture">
            <Upload
              name="logo"
              beforeUpload={(file) => {
                uploadingImage(file);
                return false;
              }}
            >
              <Button className="secondary" icon={<UploadOutlined />}>
                Upload Profile Picture
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
              <Button className="red" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ManageProfile;
