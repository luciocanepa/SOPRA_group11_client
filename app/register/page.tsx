"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Form, Input } from "antd";
import Link from "next/link";

const Register: React.FC = () => {
    const router = useRouter();
    const apiService = useApi();
    const [form] = Form.useForm();

    const hashPassword = async (password: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    };

    const handleRegister = async (values: { username: string; password: string }) => {
        try {
            // Hash the password before sending it to the backend
            const hashedPassword = await hashPassword(values.password);
            const response = await apiService.post("/users/register", {
                username: values.username,
                password: hashedPassword,
            });
            if (response) {
                alert("Registration successful! Redirecting to dashboard.");
                router.push("/dashboard");
            }
        } catch (error) {
            if (error instanceof Error) {
                alert(`Registration failed: ${error.message}`);
            } else {
                console.error("An unknown error occurred during registration.");
            }
        }
    };

    return (
        <div className="register-container text-black">
            <h2>Pomodoro Study Room</h2>
            <Form form={form} name="register" size="large" onFinish={handleRegister} layout="vertical">
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: "Please input your username!" }]}>
                    <Input placeholder="Enter username" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: "Please input your password!" },
                        { min: 8, message: "Password must be at least 8 characters long!" },
                        { pattern: /[A-Z]/, message: "Password must contain at least one uppercase letter!" },
                        { pattern: /[a-z]/, message: "Password must contain at least one lowercase letter!" },
                        { pattern: /\d/, message: "Password must contain at least one number!" },
                        { pattern: /[^A-Za-z0-9]/, message: "Password must contain at least one special character!" },
                    ]}>
                    <Input.Password placeholder="Enter password" />
                </Form.Item>
                <Form.Item>
                    <button type="submit" className="register-button">
                        Sign Up
                    </button>
                </Form.Item>
            </Form>
            <p>
                Already have an account?{" "}
                <Link href="/login">
                    Log in
                </Link>
            </p>
        </div>
    );
};

export default Register;
