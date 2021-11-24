import React from "react";
// import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const Navbar = () => {
  return (
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
      </ul>
    </div>
  );
};
