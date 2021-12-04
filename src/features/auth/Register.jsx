import React, { useEffect, useState } from "react";
import { ErrorToast } from "../status/ErrorToast";
import * as yup from "yup";
import schema from "../utils/formValidation";
import { useAuth } from "../utils/auth-config";

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
              setTimeout(() => {
                setError(null);
              }, 5000);
            }
          }}
        >
          <input
            type="text"
            name="username"
            className="login__form-input"
            placeholder="Username"
            required
            value={form.username}
            onChange={handleChange}
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
          <input
            type="password"
            name="passwordConfirmation"
            className="login__form-input"
            placeholder="Confirm Password"
            required
            value={form.passwordConfirmation}
            onChange={handleChange}
          />
          <div className="login__errors">
            <p className="login__errors-p">{formErrors.username}</p>
            <p className="login__errors-p">{formErrors.password}</p>
            {disabled && <p className="login__errors-p">{formErrors.passwordConfirmation}</p>}
          </div>
          <button type="submit" className="login__form-btn add-btn-submit" disabled={disabled}>
            Register
          </button>
        </form>
      </div>
      {error && <ErrorToast errorMessage={error.message} location="register" />}
    </div>
  );
};
