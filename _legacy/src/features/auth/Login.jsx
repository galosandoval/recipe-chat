import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorToast } from "../status/ErrorToast";
import { useAuth } from "../utils/auth-config";
import schema from "../utils/formValidation";
import * as yup from "yup";

const initialFormErrors = {
  username: "",
  password: ""
};

const initialForm = {
  username: "",
  password: ""
};

export const Login = () => {
  const { login, isLoggingIn } = useAuth();
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [form, setForm] = useState(initialForm);
  const [disabled, setDisabled] = useState(true);

  const validation = (name, value) => {
    yup
      .reach(schema, name)
      .validate(value)
      .then((_res) => {
        setFormErrors({ ...formErrors, [name]: "" });
      })
      .catch((err) => {
        setFormErrors({ ...formErrors, [name]: err.message });
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((state) => ({ ...state, [name]: value }));

    validation(name, value);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const creds = {
      username: form.username.toLowerCase().trim(),
      password: form.password
    };

    try {
      await login(creds);
    } catch (error) {
      setError(error);
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleDemoLogin = async () => {
    const creds = {
      username: "demo",
      password: "password"
    };

    try {
      await login(creds);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    schema.isValid(form).then((valid) => {
      setDisabled(!valid);
    });
  }, [form]);

  return (
    <div className="login">
      <div className="login__background">
        <div className="login__primary-color"></div>
        <div className="login__top">
          <h1>listy</h1>
          <button onClick={handleDemoLogin} className="add-btn-submit login__btn">
            {isLoggingIn ? "Loading..." : "Demo Login"}
          </button>
        </div>
        <form className="login__form" onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            className="login__form-input"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
            autoComplete="false"
          />
          <input
            type="password"
            name="password"
            className="login__form-input"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <div className="login__errors">
            <p className="login__errors-p">{formErrors.username}</p>
            <p className="login__errors-p">{formErrors.password}</p>
          </div>
          <button
            id="login-user"
            type="submit"
            className="login__form-btn add-btn-submit"
            disabled={disabled}
          >
            Login
          </button>
        </form>
      </div>
      <Link className="login__register" to="/register">
        Create an account
      </Link>
      {error && <ErrorToast errorMessage={JSON.stringify(error)} location="login" />}
    </div>
  );
};
