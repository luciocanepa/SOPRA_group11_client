"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Form, Input } from "antd";
import Link from "next/link";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { JSX } from "react";
import "../styles/pages/login.css";

interface RegisterForm {
  username: string;
  password: string;
}

const Register: () => JSX.Element = () => {
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
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Pomodoro Study Room</h2>
        <Form<RegisterForm>
          form={form}
          name="register"
          size="large"
          onFinish={handleRegister}
          layout="vertical"
          className="login-form"
        >
          <div className="form-group">
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                className="login-input"
                placeholder="Enter username"
                size="large"
              />
            </Form.Item>
          </div>
          <div className="form-group">
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long!",
                },
                {
                  pattern: /[A-Z]/,
                  message:
                    "Password must contain at least one uppercase letter!",
                },
                {
                  pattern: /[a-z]/,
                  message:
                    "Password must contain at least one lowercase letter!",
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
              <Input.Password
                className="login-input"
                placeholder="Enter password"
                size="large"
              />
            </Form.Item>
          </div>
          <div className="button-group">
            <Form.Item style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                <button
                  type="submit"
                  className="login-button"
                  style={{ flex: 1 }}
                >
                  Sign Up
                </button>
                <Link
                  href="/login"
                  className="signup-button"
                  style={{ flex: 1, display: "flex", justifyContent: "center" }}
                >
                  Go to Login
                </Link>
              </div>
            </Form.Item>
          </div>
          <p className="signup-prompt">Already have an account?</p>
        </Form>
      </div>
    </div>
  );
};

export default Register;
