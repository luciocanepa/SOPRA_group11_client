"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
//import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message, Select, Upload , DatePicker} from "antd";
import { EditOutlined, UploadOutlined } from "@ant-design/icons";
import "@/styles/pages/edit.css";
import Image from 'next/image';
import moment from 'moment-timezone';

const timezones = moment.tz.names()
/*[
    { value: "UTC", label: "UTC" },
    { value: "GMT", label: "GMT" },
    { value: "PST", label: "Pacific Standard Time (UTC-8)" },
    { value: "MST", label: "Mountain Standard Time (UTC-7)" },
    { value: "CST", label: "Central Standard Time (UTC-6)" },
    { value: "EST", label: "Eastern Standard Time (UTC-5)" },
];*/

  const ManageProfile: React.FC = () => {
    console.log("Component Rendered");
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();
    const [user, setUser] = useState<User | null>(null);
    const {id} = useParams();



    const [isEdit, setIsEdit] = useState({
        username: false,
        name: false,
        password: false,
        birthday: false,
        timezone: false,
      });




    const hashPassword = async (password: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
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
            message.error(`${file.name} upload failed.`);
            console.error("Upload error:", error);
        };
    };




      useEffect(() => {
        console.log("Fetching user data");
        const fetchingUser = async () => {
          try {
            const user = await apiService.get<User>(`/users/${id}`);
            console.log("User fetched:", user);
            //console.log("Profile picture correctly fetched?:", user.profilePicture);
            setUser(user);
            if (user.profilePicture) {
              setUploadedImage(user.profilePicture);
            }
            const token = localStorage.getItem("token");
                if (!token) return;
                console.log("Token:", token);
                form.setFieldsValue({
                username: user.username,
                name: user.name ?? undefined,
                birthday: user.birthday ?? undefined,
                timezone: user.timezone ?? undefined,
              });
          } catch (error) {
            if (error instanceof Error) {
              alert(`Something went wrong while fetching the user:\n${error.message}`);
            } else {
              console.error("An unknown error occurred while fetching the user.");
            }
          }
        };

        fetchingUser();

    },[id, apiService, form]);



    const handleUserEdit = async () => {
      console.log("handleUserEdit triggered");

        try {
            const values = form.getFieldsValue();
            console.log("values:", values);
            const edits: Partial<User> = {};
        
            // Check for changes and only include them in the updates object
            if (values.username !== user?.username) {
                edits.username = values.username;
            }
            if (values.name !== user?.name) {
                edits.name = values.name;
            }
            if (values.password) { // Include password only if it's provided (new value)
                const hashedPassword = await hashPassword(values.password);
                edits.password = hashedPassword; // You may want to hash it before sending
            }
            if (values.birthday !== user?.birthday) {
                edits.birthday = values.birthday;
            }
            if (values.timezone !== user?.timezone) {
                edits.timezone = values.timezone;
            }
            if (uploadedImage) {
                edits.profilePicture = uploadedImage;
            }

            console.log("edited profile:", edits);



            console.log("Sending PUT to: ", `/users/${user?.id}`);
            console.log("Auth. token", JSON.parse(localStorage.getItem("token") || "null"))
            await apiService.put(`/users/${user?.id}`, edits, {
              Authorization: JSON.parse(localStorage.getItem("token") || "null")
            });
            console.log("Save button clicked");
            message.success("Profile updated successfully");
            setIsEdit({ 
                username: false,
                name: false,
                password: false,
                birthday: false,
                timezone: false,
            }); // reset editable state
            alert("Edit successful!");
            router.push(`/edit/${user?.id}`);
        } catch (error) {
          message.error("Failed to update profile");
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
          onFinish={handleUserEdit}
          layout="vertical"

        >
            <h2>Profile Management</h2>

        <div className="profile-image-container">
        <Image
            src={
                uploadedImage
                    ? `data:image/png;base64,${uploadedImage}`
                    : "/tomato.JPG"
            }
            alt="Profile"
            className="profile-image"
            width={150}  // Add appropriate width
            height={150} // Add appropriate height
            unoptimized={!!uploadedImage} // Needed for base64 images
        />
        </div>
            


          <Form.Item
            name="username"
            label="Username">

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
                placeholder = "What's your name?"
                suffix={
                <EditOutlined
                    className="edit-icon"
                    onClick={() =>
                    setIsEdit((prev) => ({ ...prev, name: true }))
                    }
                />
                }
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: false, message: "Please input a new Password" },
                { min: 8, message: "Password must be at least 8 characters long!" },
                { pattern: /[A-Z]/, message: "Password must contain at least one uppercase letter!" },
                { pattern: /[a-z]/, message: "Password must contain at least one lowercase letter!" },
                { pattern: /\d/, message: "Password must contain at least one number!" },
                { pattern: /[^A-Za-z0-9]/, message: "Password must contain at least one special character!" }
            ]}
          >
            <Input
                type="password"
                placeholder = "Change password"
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


          <Form.Item
                name="birthday"
                label="Birthday"
                >
                {isEdit.birthday ? (
                    <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Select date"
                    format="YYYY-MM-DD"
                    inputReadOnly
                    />
                ) : (
                    <Input
                    value={form.getFieldValue("birthday")}
                    readOnly
                    suffix={
                        <EditOutlined
                        className="edit-icon"
                        onClick={() =>
                            setIsEdit((prev) => ({ ...prev, birthday: true }))
                        }
                        />
                    }
                    />
                )}
            </Form.Item>


          <Form.Item
            name="timezone"
            label="Timezone"

          >
            <Select
                disabled={!isEdit.timezone}
                placeholder="Select from the dropdown menu"
                onChange={(value) => form.setFieldsValue({ timezone: value })}
                suffixIcon={<EditOutlined className="edit-icon" onClick={() => setIsEdit((prev) => ({ ...prev, timezone: true }))} />}
            >
                {timezones.map((tz) => (
                    <Select.Option key={tz} value={tz}>
                        {tz}
                    </Select.Option>
                ))}
            </Select>
          </Form.Item>




          <Form.Item
            name="profilePicture"
            label="Profile Picture"

            >
            <Upload
                name="logo"
                beforeUpload={(file) => {
                    uploadingImage(file);
                    return false;
        }}
            >
                <Button className="groupCreation-upload" icon={<UploadOutlined />}>Upload Profile Picture</Button>
            </Upload>
          </Form.Item>


          
          <Form.Item>
            <Button htmlType="submit" className="groupCreation-button">
              Save Profile Changes
            </Button>
          </Form.Item>
          <Form.Item>
          <Button className="groupCreation-button" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </Form.Item>
        </Form>
      </div>
      </div>
    );
  };
  
  export default ManageProfile;

