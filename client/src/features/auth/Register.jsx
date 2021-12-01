import React, { useState } from "react";
import { ErrorToast } from "../status/ErrorToast";
import { useAuth } from "../utils/auth";

export const Register = () => {
  const { register } = useAuth();
  const [error, setError] = useState(null);

  return (
    <div className="login register">
      <div className="login__background">
        <div className="login__primary-color"></div>
        <div className="login__top">
          <h1>Sign Up</h1>
        </div>
        <form
          className="login__form"
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const creds = {
              username: formData.get("username"),
              password: formData.get("password")
            };
            try {
              await register(creds);
            } catch (error) {
              setError(error);
            }
          }}
        >
          <input type="text" name="username" className="login__form-input" placeholder="Username" />
          <input
            type="password"
            name="password"
            className="login__form-input"
            placeholder="Password"
          />
          {/* <input
            type="text"
            name="confirm-password"
            className="login__form-input"
            placeholder="Confirm Password"
          /> */}
          <button type="submit" className="login__form-btn add-btn-submit">
            Register
          </button>
        </form>
      </div>
      {error && <ErrorToast errorMessage={error.message} location="register" />}
    </div>
  );
};
