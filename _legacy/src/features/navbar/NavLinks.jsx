import React from "react";

import { NavLink, useHistory } from "react-router-dom";
import { useAuth } from "../utils/auth-config";

export const NavLinks = () => {
  const { logout } = useAuth();
  const history = useHistory();
  return (
    <>
      <li className="navbar__item">
        <NavLink className="navbar__link" activeClassName="navbar__active" exact to="/">
          Grocery Lists
        </NavLink>
      </li>
      <li className="navbar__item">
        <NavLink className="navbar__link" activeClassName="navbar__active" to="/recipes">
          Recipes
        </NavLink>
      </li>
      <li className="navbar__item">
        <button
          className="navbar__logout add-btn-submit"
          onClick={() => {
            history.replace("/");
            logout();
          }}
        >
          Logout
        </button>
      </li>
    </>
  );
};
