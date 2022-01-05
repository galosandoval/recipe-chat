import React from "react";

import { useHistory } from "react-router-dom";
import { useAuth } from "../utils/auth-config";
import { ListItem, LogoutButton, StyledNavlink } from "./StyledNavBar";

export const NavLinks = () => {
  const { logout } = useAuth();
  const history = useHistory();
  return (
    <>
      <ListItem>
        <StyledNavlink exact to="/">
          Grocery Lists
        </StyledNavlink>
      </ListItem>
      <ListItem>
        <StyledNavlink to="/recipes">Recipes</StyledNavlink>
      </ListItem>
      <ListItem>
        <LogoutButton
          onClick={() => {
            history.replace("/");
            logout();
          }}
        >
          Logout
        </LogoutButton>
      </ListItem>
    </>
  );
};
