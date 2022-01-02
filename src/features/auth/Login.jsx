import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorToast } from "../status/ErrorToast";
import { useAuth } from "../utils/auth-config";
import schema from "../utils/formValidation";
import * as yup from "yup";
import {
  Background,
  Errors,
  LoginButton,
  LoginForm,
  LoginFormButton,
  LoginInput,
  PrimaryColor,
  RegisterLink,
  StyledLogin,
  Top
} from "./StyledAuth";

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
    <StyledLogin>
      <Background>
        <PrimaryColor></PrimaryColor>
        <Top>
          <h1>listy</h1>
          <LoginButton onClick={handleDemoLogin}>
            {isLoggingIn ? "Loading..." : "Demo Login"}
          </LoginButton>
        </Top>
        <LoginForm onSubmit={handleLogin}>
          <LoginInput
            type="text"
            name="username"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
            autoComplete="false"
          />
          <LoginInput
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <Errors>
            <p>{formErrors.username}</p>
            <p>{formErrors.password}</p>
          </Errors>
          <LoginFormButton id="login-user" type="submit" disabled={disabled}>
            Login
          </LoginFormButton>
        </LoginForm>
      </Background>
      <RegisterLink to="/register">Create an account</RegisterLink>
      {error && <ErrorToast errorMessage={JSON.stringify(error)} location="login" />}
    </StyledLogin>
  );
};
