import React from "react";
import { useAddUser } from "../services/authService";
import { useLogin } from "../services/authService";
import { useHistory } from "react-router-dom";
import { ErrorToast } from "../status/ErrorToast";

export const Register = () => {
  const { mutateAsync: addUser, isSuccess, data } = useAddUser();
  const { mutate: login } = useLogin();
  const history = useHistory();

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
            console.log({ creds });
            await addUser(creds);
            login();
            history.push("/grocerylist");
          }}
        >
          <input type="text" name="username" className="login__form-input" placeholder="Username" />
          <input type="text" name="password" className="login__form-input" placeholder="Password" />
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
      {isSuccess && data.data.status === "error" && <ErrorToast errorMessage={data.data.error} />}
    </div>
  );
};
