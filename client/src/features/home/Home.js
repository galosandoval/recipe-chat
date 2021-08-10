import React from "react";

export const Home = (props) => {
  return (
    <div>
      <h1>Home</h1>
      <button onClick={props.auth.login}>Log In</button>
    </div>
  );
};
