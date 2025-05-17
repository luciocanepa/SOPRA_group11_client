"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Form, Input } from "antd";
import Link from "next/link";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { JSX, useState } from "react";
import toast from "react-hot-toast";

import "../styles/module.css";

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

  const [enabled, setEnabled] = useState(true);

  const handleRegister = async (values: RegisterForm) => {
    if(!enabled) return;
    setEnabled(false)
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
        // console.log("Registration successful! Redirecting to dashboard.");
        toast.success(
            <div>
              <div><strong>Registration successful!</strong></div>
              <div>Redirecting to Dashboard.</div>
            </div>
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (error) {
      setEnabled(true);
      if (error instanceof Error) {
        toast.error(
            <div>
              <div><strong>Registration failed:</strong></div>
              <div>This username is already taken.</div>
            </div>
        );
      } else {
        // console.error("An unknown error occurred during registration.");
        toast.error(
            <div>
              <div><strong>Registration failed:</strong></div>
              <div>Unknown error occurred. Please try again.</div>
            </div>
        );
      }
    }
  };

  return (
    <div className="single-page-container">
      <div className="form-container">
        <h2 className="login-title">Pomodoro Study Room</h2>
        <Form<RegisterForm>
          form={form}
          name="register"
          size="large"
          onFinish={handleRegister}
          layout="vertical"
          className="form"
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
                className="input"
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
                className="input"
                placeholder="Enter password"
                size="large"
              />
            </Form.Item>
          </div>
          <div className={`button-group ${enabled ? "" : "disabled"}`}>
            <Form.Item style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: "20px", width: "100%" }}>
                <button
                  type="submit"
                  className="button primary"
                  style={{ flex: 1 }}
                >
                  Sign Up
                </button>
                <Link
                  href="/login"
                  className="button link"
                  style={{ flex: 1, display: "flex", justifyContent: "center" }}
                >
                  Go to Login
                </Link>
              </div>
            </Form.Item>
          </div>
          {/* <p className="signup-prompt">Already have an account?</p> */}
        </Form>
      </div>
    </div>
  );
};

export default Register;
