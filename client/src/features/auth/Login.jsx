import React from "react";
import { Link } from "react-router-dom";
import { useLogin } from "../services/authService";
import { ErrorToast } from "../status/ErrorToast";

export const Login = () => {
  const { mutate, isSuccess, data } = useLogin();
  return (
    <div className="login">
      <div className="login__background">
        <div className="login__primary-color"></div>
        <div className="login__top">
          <h1>Login Form</h1>
          <button className="add-btn-submit login__btn">Demo Login</button>
        </div>
        <form
          className="login__form"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.target);
            const creds = {
              username: formData.get("username"),
              password: formData.get("password")
            };

            mutate(creds);
          }}
        >
          <input type="text" name="username" className="login__form-input" placeholder="Username" />
          <input type="text" name="password" className="login__form-input" placeholder="Password" />
          <button type="submit" className="login__form-btn add-btn-submit">
            Login
          </button>
        </form>
      </div>
      <Link className="login__register" to="/register">
        Create an account
      </Link>
      {isSuccess && data.data.status === "error" && <ErrorToast errorMessage={data.data.error} />}
    </div>
  );
};
