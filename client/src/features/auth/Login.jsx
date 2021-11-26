import React from "react";
import { Link } from "react-router-dom";

export const Login = () => {
  return (
    <div className="login">
      <div className="login__background">
        <div className="login__primary-color"></div>
        <div className="login__top">
          <h1>Login Form</h1>
          <button className="add-btn-submit login__btn">Demo Login</button>
        </div>
        <form className="login__form">
          <input type="text" name="username" className="login__form-input" placeholder="Username" />
          <input type="text" name="password" className="login__form-input" placeholder="Password" />
          <button type="submit" className="login__form-btn add-btn-submit">
            Login
          </button>
        </form>
      </div>
      <Link className="login__register" exact to="/register">
        Create an account
      </Link>
    </div>
  );
};
