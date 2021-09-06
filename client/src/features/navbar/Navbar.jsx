import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  width: 100%;
  ul {
    display: flex;
    justify-content: space-between;
    list-style: none;
    width: 60%;
  }
`;

export const Navbar = () => {
  return (
    <Nav>
      <div className="logo">GS</div>
      <ul>
        <li>
          <Link to="/">Grocery Lists</Link>
        </li>
        <li>
          <Link to="/recipes">Recipes</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/archived">Archived</Link>
        </li>
      </ul>
    </Nav>
  );
};
