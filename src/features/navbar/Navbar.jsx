import React, { useState } from "react";
import { menuSVG, plusSVG, xSVG } from "../../styles/svgs";
import { NavLinks } from "./NavLinks";
import { Sidebar } from "./Sidebar";
import { FormContainer } from "./FormContainer";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { addBlur, removeBlur } from "../utils/modalBlur";
import { AddButton, StyledNavbar } from "./StyledNavBar";

const initialSidebarState = {
  left: "-100%"
};
const initialFormStyle = {
  transform: "translateX(130%)",
  opacity: "0"
};

export const Navbar = () => {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState(initialSidebarState);
  const [formStyle, setFormStyle] = useState(initialFormStyle);
  const [formVisible, setFormVisible] = useState(false);

  const handleSidebar = (event) => {
    const circles = document.querySelectorAll(".carousel__circles");
    const arrows = document.querySelectorAll(".carousel__buttons");
    const body = document.querySelector("body");
    const sidebar = document.querySelector("#sidebar");

    if (event.target.name === "sidebar") {
      const closebtn = document.querySelector(".navbar__checkbox");
      closebtn.click();
    }

    if (sidebarVisible) {
      setTimeout(() => {
        circles.forEach((c) => (c.style.zIndex = 1));
        arrows.forEach((c) => (c.style.zIndex = 1));
        body.style.pointerEvents = "all";
      }, 800);
      setSidebarVisible(false);
      setSidebarStyle(initialSidebarState);
      enableBodyScroll(sidebar);
    } else {
      circles.forEach((c) => (c.style.zIndex = 0));
      arrows.forEach((c) => (c.style.zIndex = 0));
      body.style.pointerEvents = "none";
      setSidebarVisible(true);
      setSidebarStyle({ left: "0" });
      disableBodyScroll(sidebar);
    }
  };

  const handleClick = () => {
    const formContainer = document.querySelector("#form-container");
    if (formVisible) {
      setFormStyle(initialFormStyle);
      setFormVisible(false);
      enableBodyScroll(formContainer);
      removeBlur();
    } else {
      setFormStyle({
        transform: "translateX(0)",
        opacity: "1",
        visibility: "visible"
      });
      setFormVisible(true);
      disableBodyScroll(formContainer);
      addBlur();
    }
  };
  return (
    <>
      <StyledNavbar>
        <ul className="navbar__list navbar__list--default">
          <h1 className="navbar__logo logo">listy</h1>
          <NavLinks />
          <AddButton id="form" onClick={handleClick}>
            {xSVG}
          </AddButton>
        </ul>
        <div className="navbar__list navbar__list--phone">
          <input type="checkbox" className="navbar__checkbox" id="nav-toggle" />
          <label onClick={handleSidebar} className="navbar__list-btn" htmlFor="nav-toggle">
            {sidebarVisible ? xSVG : menuSVG}
          </label>
          <h1 className="navbar__logo logo">listy</h1>
          <button id="form" className="navbar__btn-add" onClick={handleClick}>
            {plusSVG}
          </button>
          <div className="navbar__background"></div>
        </div>
        <Sidebar handleSidebar={handleSidebar} sidebarStyle={sidebarStyle} />
      </StyledNavbar>
      {/* <header className="navbar navbar--hidden">
        <ul className="navbar__list navbar__list--default">
          <h1 className="navbar__logo logo">listy</h1>
          <NavLinks />
          <button id="form" className="x-svg-btn navbar__btn-add" onClick={handleClick}>
            {xSVG}
          </button>
        </ul>
        <div className="navbar__list navbar__list--phone">
          <input type="checkbox" className="navbar__checkbox" id="nav-toggle" />
          <label onClick={handleSidebar} className="navbar__list-btn" htmlFor="nav-toggle">
            {sidebarVisible ? xSVG : menuSVG}
          </label>
          <h1 className="navbar__logo logo">listy</h1>
          <button id="form" className="navbar__btn-add" onClick={handleClick}>
            {plusSVG}
          </button>
          <div className="navbar__background"></div>
        </div>
        <Sidebar handleSidebar={handleSidebar} sidebarStyle={sidebarStyle} />
      </header> */}
      <FormContainer formStyle={formStyle} handleClick={handleClick} />
    </>
  );
};
