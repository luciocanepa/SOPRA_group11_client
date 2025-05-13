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

interface LoginForm {
  username: string;
  password: string;
}

const Login: () => JSX.Element = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm<LoginForm>();

  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("id", "");

  const [enabled, setEnabled] = useState(true);

  const handleLogin = async (values: LoginForm) => {
    if (!enabled) return;
    setEnabled(false);
    try {
      const response = await apiService.post<User>(
        "/users/login",
        {
          username: values.username,
          password: values.password,
        },
        null,
      );
      if (response && response.token && response.id) {
        setToken(response.token);
        setUserId(response.id);
        // console.log("Login successful! Redirecting to dashboard.");
        toast.success(
            <div>
              <div><strong>Login successful!</strong></div>
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
        // console.error("Login failed:", error.message);
        toast.error(
            <div>
              <div><strong>Login failed:</strong></div>
              <div>User not found or wrong password.</div>
            </div>
        );
      } else {
        // console.error("An unknown error occurred during login.");
        toast.error(
            <div>
              <div><strong>Login failed:</strong></div>
              <div>Unknown error</div>
            </div>
        );
      }
    }
  };

  return (
    <div className="single-page-container">
      <div className="form-container">
        <h2 className="login-title">Pomodoro Study Room</h2>
        <Form<LoginForm>
          form={form}
          name="login"
          onFinish={handleLogin}
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
              ]}
            >
              <Input.Password
                className="login-input"
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
                  Login
                </button>
                <Link
                  href="/register"
                  className="button link"
                  style={{ flex: 1, display: "flex", justifyContent: "center" }}
                >
                  Go to Sign Up
                </Link>
              </div>
            </Form.Item>
          </div>
          {/* <p className="signup-prompt">No account yet?</p> */}
        </Form>
      </div>
    </div>
  );
};

export default Login;
