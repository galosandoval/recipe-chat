import React, { useEffect, useState } from "react";
import { ErrorToast } from "../status/ErrorToast";
import * as yup from "yup";
import schema from "../utils/formValidation";
import { useAuth } from "../utils/auth-config";
import { useHistory } from "react-router-dom";
import {
  Background,
  Errors,
  LoginFormButton,
  LoginInput,
  PrimaryColor,
  RegisterForm,
  RegisterTop,
  StyledLogin
} from "./StyledAuth";

const initialFormErrors = {
  username: "",
  password: "",
  passwordConfirmation: ""
};

const initialForm = {
  username: "",
  password: "",
  passwordConfirmation: ""
};

export const Register = () => {
  const { register } = useAuth();
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [form, setForm] = useState(initialForm);
  const [disabled, setDisabled] = useState(true);
  const history = useHistory();

  const validation = (name, value) => {
    yup
      .reach(schema, name)
      .validate(value)
      .then((res) => {
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

  useEffect(() => {
    schema.isValid(form).then((valid) => {
      setDisabled(!valid);
    });
  }, [form]);

  return (
    <StyledLogin>
      <Background>
        <PrimaryColor></PrimaryColor>
        <RegisterTop>
          <h1>listy</h1>
          <h1>Sign Up</h1>
        </RegisterTop>
        <RegisterForm
          onSubmit={async (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const creds = {
              username: formData.get("username"),
              password: formData.get("password")
            };
            try {
              await register(creds);
              history.replace("/");
            } catch (error) {
              setError(error);
              setTimeout(() => {
                setError(null);
              }, 5000);
            }
          }}
        >
          <LoginInput
            type="text"
            name="username"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
          />
          <LoginInput
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <LoginInput
            type="password"
            name="passwordConfirmation"
            placeholder="Confirm Password"
            required
            value={form.passwordConfirmation}
            onChange={handleChange}
          />
          <Errors>
            <p>{formErrors.username}</p>
            <p>{formErrors.password}</p>
            {disabled && <p>{formErrors.passwordConfirmation}</p>}
          </Errors>
          <LoginFormButton type="submit" disabled={disabled}>
            Register
          </LoginFormButton>
        </RegisterForm>
      </Background>
      {error && <ErrorToast errorMessage={error.message} location="register" />}
    </StyledLogin>
  );
};
