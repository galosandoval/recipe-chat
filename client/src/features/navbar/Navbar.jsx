import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 700px;
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
      </ul>
    </Nav>
  );
};
