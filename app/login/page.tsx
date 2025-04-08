"use client";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { JSX, useState } from "react"; // Add useState import
import "../styles/pages/login.css";

interface FormFieldProps {
  username: string;
  password: string;
}

const Login: () => JSX.Element = () => {
  const router = useRouter();
  const apiService = useApi();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const [errors, setErrors] = useState({ username: '', password: '' }); // Add error state

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const values = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    // Validate inputs
    const newErrors = {
      username: !values.username ? 'Please put in your username!' : '',
      password: !values.password ? 'Please put in your password!' : ''
    };

    setErrors(newErrors);

    // Don't proceed if there are errors
    if (newErrors.username || newErrors.password) {
      return;
    }

    try {
      const response = await apiService.post<User>("/users/login", values);
      if (response.token) {
        setToken(response.token);
      }
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  const handleSignUpRedirect = () => {
    router.push("/register");
  };

  return (
      <div className="login-page">
        <div className="login-container">
          <h1 className="login-title">Pomodoro Study Room</h1>
          <form onSubmit={handleLogin} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Please enter your username"
                  className="login-input"
                  required
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Please enter your password"
                  className="login-input"
                  required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="button-group">
              <button type="submit" className="login-button">
                Login
              </button>
              <button type="button" onClick={handleSignUpRedirect} className="signup-button">
                Go to Sign Up
              </button>
            </div>
          </form>
          <p className="signup-prompt">No account yet?</p>
        </div>
      </div>

  );
};

export default Login;