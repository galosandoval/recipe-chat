import React from "react";
import { NavLinks } from "./NavLinks";

export const Sidebar = ({ sidebarStyle }) => {
  return (
    <ul className="sidebar" style={sidebarStyle}>
      <NavLinks />
    </ul>
  );
};
