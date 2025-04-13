"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Form, Input } from "antd";
import Link from "next/link";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm<LoginForm>();

  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUserId } = useLocalStorage<string>("id", "");

  const handleLogin = async (values: LoginForm) => {
    try {
      const response = await apiService.post<User>("/users/login", {
        username: values.username,
        password: values.password,
      });
      if (response && response.token && response.id) {
        setToken(response.token);
        setUserId(response.id);
        console.log("Login successful! Redirecting to dashboard.");
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Login failed:", error.message);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div className="login-container text-black">
      <h2>Pomodoro Study Room</h2>
      <Form<LoginForm>
        form={form}
        name="login"
        size="large"
        onFinish={handleLogin}
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
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item>
          <button type="submit" className="login-button">
            Login
          </button>
        </Form.Item>
      </Form>
      <p>
        No account yet? <Link href="/register">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
