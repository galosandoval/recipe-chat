import React from "react";
import { Route, Navigate } from "react-router-dom";
import isLoggedIn from "./isLoggedIn";

export const PublicRoute = ({ component: Component, restricted, ...rest }) => {
  return (
    // restricted = false meaning public route
    // restricted = true meaning restricted route
    
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn() && restricted ? <Navigate to="/grocerylist" /> : <Component {...props} />
      }
    />
  );
};
