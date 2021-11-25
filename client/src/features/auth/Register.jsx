import React from "react";

export const Register = () => {
  return (
    <div className="login register">
      <div className="login__background">
        <div className="login__primary-color"></div>
        <div className="login__top">
          <h1>Sign Up</h1>
        </div>
        <form className="login__form">
          <input type="text" className="login__form-input" placeholder="Username" />
          <input type="text" className="login__form-input" placeholder="Password" />
          <input type="text" className="login__form-input" placeholder="Confirm Password" />
          <button type="submit" className="login__form-btn add-btn-submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};
