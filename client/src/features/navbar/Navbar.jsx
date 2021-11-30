import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import { useAuth } from "../utils/auth";

export const Navbar = () => {
  const { logout } = useAuth();
  const history = useHistory();
  return (
    <>
      <div className="navbar">
        <div className="navbar__logo">GS</div>
        <ul className="navbar__list">
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
                logout();
                history.replace("/");
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};
