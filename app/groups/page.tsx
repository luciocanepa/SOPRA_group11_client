"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, message, Upload } from "antd";
import { Group } from "@/types/group";
import { UploadOutlined } from "@ant-design/icons";
import "@/styles/pages/groups.css";
import useLocalStorage from "@/hooks/useLocalStorage";

interface FormFieldProps {
  name: string;
  description: string;
  image: string;
  adminId: string;
  members: string[];
}

const GroupCreation: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const { value: token } = useLocalStorage<string>("token", "");
  // const { value: id } = useLocalStorage<string>("id", "");

  // const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // useEffect(() => {
  //   const fetchLoggedInUser = async () => {
  //     if (!token || !id) return;

  //     try {
  //       const user = await apiService.get<User>(`/users/${id}`, token);
  //       setLoggedInUser(user);

  //       // const storedToken = String(token).replace(/\s+/g, "").trim();
  //       // const fetchedToken = user.token
  //       //   ? String(user.token).replace(/\s+/g, "").trim()
  //       //   : "";
  //       // const wrappedFetchedToken = `"${fetchedToken}"`;
  //       // console.log("Fetched User:", user);
  //       // console.log("Fetched Token from User:", fetchedToken);
  //       // console.log("Stored Token in localStorage:", storedToken);
  //       // console.log("Stored User ID in localStorage:", id);
  //       // console.log("Wrapped Fetched Token:", wrappedFetchedToken);

  //       // if (storedToken == wrappedFetchedToken) {
  //       //   setLoggedInUserId(user.id);
  //       // } else {
  //       //   console.warn("No matching user found for stored token");
  //       // }
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         alert(
  //           `Something went wrong while fetching groups:\n${error.message}`,
  //         );
  //       } else {
  //         console.error("An unknown error occurred while fetching groups.");
  //       }
  //     }
  //   };

  //   fetchLoggedInUser();
  // }, [apiService, token, id]);

  const handleGroupCreation = async (values: FormFieldProps) => {
    try {
      const requestBody = {
        ...values,
        image: uploadedImage || null,
      };
      const newGroup = await apiService.post<Group>(
        "/groups",
        requestBody,
        token,
      );

      router.push(`/groups/${newGroup.id}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during group creation:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during group creation.");
      }
    }
  };

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  /*const uploadingImage = async (info: any) => {
        const formData = new FormData();
        formData.append("file", info.file);
    
        try {
            const response = await apiService.post<{ imageUrl: string }>("/upload", formData);
            setUploadedImage(response.imageUrl);
            message.success(`${info.file.name} uploaded successfully`);
        } catch (error) {
            message.error(`${info.file.name} upload failed.`);
        }
    };*/ //if we would like to store the picture in the backend with an URL
  /*                name="logo"
                action="/upload.do" // Change this to your upload URL
                onChange={uploadingImage}
                beforeUpload={() => false} // Prevent automatic upload*/ //--> this part would belong to the upload part in the form
  /*           valuePropName="fileList"
            getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}*/ //--> belongs to form.item after name and label

  // -->   solution apprach with bas64String for the image (above would be with a post so an url would get stored)
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

  return (
    <div className="background-container">
      <div className="groupCreation-container">
        <Form
          form={form}
          name="group creation"
          size="large"
          variant="outlined"
          onFinish={handleGroupCreation}
          layout="vertical"
        >
          <h2>Create your own study group</h2>
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

          {/* <Form.Item
            name="members"
            label="Members"
            rules={[
              {
                required: false,
                message:
                  "Please input usernames of the members you want to add, use a comma to seperate!",
              },
            ]}
          >
            <Input placeholder="Enter usernames, comma-separated" />
          </Form.Item> */}

          <Form.Item name="image" label="Group Picture">
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
              Create Group
            </Button>
          </Form.Item>
          <p>You changed your mind on creating a group?</p>
          <Form.Item>
            <Button
              className="groupCreation-button"
              onClick={() => router.push("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default GroupCreation;
