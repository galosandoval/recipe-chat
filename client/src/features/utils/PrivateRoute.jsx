import React from "react";
import { Route, Navigate, Routes } from "react-router-dom";
import isLoggedIn from "./isLoggedIn";

export const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    // Show the component only when the user is logged in
    // Otherwise, redirect the user to /signin page
    <Routes>
      <Route
        {...rest}
        render={(props) => (isLoggedIn() ? <Component {...props} /> : <Navigate to="/login" />)}
      />
    </Routes>
  );
};
