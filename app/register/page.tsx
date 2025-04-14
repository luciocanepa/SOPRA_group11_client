"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Form, Input } from "antd";
import Link from "next/link";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

interface RegisterForm {
  username: string;
  password: string;
}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm<RegisterForm>();

  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("id", "");

  const handleRegister = async (values: RegisterForm) => {
    try {
      const response = await apiService.post<User>(
        "/users/register",
        {
          username: values.username,
          password: values.password,
        },
        null,
      );
      if (response && response.token && response.id) {
        setToken(response.token);
        setUserId(response.id);
        console.log("Registration successful! Redirecting to dashboard.");
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Registration failed:", error.message);
      } else {
        console.error("An unknown error occurred during registration.");
      }
    }
  };

  return (
    <div className="register-container text-black">
      <h2>Pomodoro Study Room</h2>
      <Form<RegisterForm>
        form={form}
        name="register"
        size="large"
        onFinish={handleRegister}
        layout="vertical"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 8, message: "Password must be at least 8 characters long!" },
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
              message: "Password must contain at least one special character!",
            },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <button type="submit" className="register-button">
            Sign Up
          </button>
        </Form.Item>
      </Form>
      <p>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
};

export default Register;
