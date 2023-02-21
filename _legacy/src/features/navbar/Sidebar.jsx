import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { useAuth } from "../utils/auth-config";

export const Sidebar = ({ sidebarStyle, handleSidebar }) => {
  const { logout } = useAuth();
  const history = useHistory();
  return (
    <ul className="sidebar" style={sidebarStyle} id="sidebar" onClick={handleSidebar} name="sidebar">
      <li className="navbar__item">
        <NavLink
          name="sidebar"
          className="navbar__link"
          activeClassName="navbar__active"
          exact
          to="/"
        >
          Grocery Lists
        </NavLink>
      </li>
      <li className="navbar__item">
        <NavLink
          name="sidebar"
          className="navbar__link"
          activeClassName="navbar__active"
          to="/recipes"
        >
          Recipes
        </NavLink>
      </li>
      <li className="navbar__item">
        <button
          className="navbar__logout add-btn-submit"
          name="sidebar"
          onClick={() => {
            history.replace("/");
            logout();
          }}
        >
          Logout
        </button>
      </li>
    </ul>
  );
};
