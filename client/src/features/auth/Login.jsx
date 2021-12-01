import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ErrorToast } from "../status/ErrorToast";
import { useAuth } from "../utils/auth";

export const Login = () => {
  const { login } = useAuth();
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    let creds;

    if (isDemo) {
      creds = { username: "demo", password: "password" };
    } else {
      creds = {
        username: formData.get("username").toLowerCase().trim(),
        password: formData.get("password")
      };
    }

    try {
      await login(creds);
    } catch (error) {
      setError(error);
    }
  };

  const handleDemoLogin = (event) => {
    event.preventDefault();

    setIsDemo(true);
    const loginButton = document.querySelector("#login-user");
    loginButton.click();
  };

  return (
    <div className="login">
      <div className="login__background">
        <div className="login__primary-color"></div>
        <div className="login__top">
          <h1>Login Form</h1>
          <button onClick={(event) => handleDemoLogin(event)} className="add-btn-submit login__btn">
            Demo Login
          </button>
        </div>
        <form className="login__form" onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            className="login__form-input"
            placeholder="Username"
            required
          />
          <input
            type="password"
            name="password"
            className="login__form-input"
            placeholder="Password"
            required
          />
          <button id="login-user" type="submit" className="login__form-btn add-btn-submit">
            Login
          </button>
        </form>
      </div>
      <Link className="login__register" to="/register">
        Create an account
      </Link>
      {error && <ErrorToast errorMessage={error.message} location="login" />}
    </div>
  );
};
