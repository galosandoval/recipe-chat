import React, { useState } from "react";
import { menuSVG, xSVG } from "../../styles/svgs";
// import { debounce } from "../utils/debounce";
import { NavLinks } from "./NavLinks";
import { Sidebar } from "./Sidebar";
import { FormContainer } from "./FormContainer";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

const initialSidebarState = {
  left: "-100%"
};
const initialFormStyle = {
  transform: "translateX(130%)",
  opacity: "0"
};

export const Navbar = () => {
  // const [visible, setVisible] = useState(true);
  // const [prevScrollPos, setPrevScrollPos] = useState(0);
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

  // const handleScroll = debounce(() => {
  //   const currentScrollPos = window.pageYOffset;

  //   setVisible(
  //     (prevScrollPos > currentScrollPos && prevScrollPos - currentScrollPos > 70) ||
  //       currentScrollPos < 10
  //   );

  //   setPrevScrollPos(currentScrollPos);
  // }, 100);

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [prevScrollPos, visible, handleScroll]);

  const handleClick = () => {
    console.log("clicked");
    if (formVisible) {
      setFormStyle(initialFormStyle);
      setFormVisible(false);
    } else {
      setFormStyle({
        transform: "translateX(0)",
        opacity: "1",
        visibility: "visible"
      });
      setFormVisible(true);
    }
  };
  return (
    <>
      <header className="navbar navbar--hidden">
        <h1 className="navbar__logo logo">listy</h1>
        <ul className="navbar__list navbar__list--default">
          <NavLinks />
          <button className="x-svg-btn navbar__btn-add" onClick={handleClick}>
            {xSVG}
          </button>
        </ul>
        <div className="navbar__list navbar__list--phone">
          <input type="checkbox" className="navbar__checkbox" id="nav-toggle" />
          <label onClick={handleSidebar} className="navbar__list-btn" htmlFor="nav-toggle">
            {sidebarVisible ? xSVG : menuSVG}
          </label>
          <div className="navbar__background">{""}</div>
        </div>
        <Sidebar handleSidebar={handleSidebar} sidebarStyle={sidebarStyle} />
      </header>
      <FormContainer formStyle={formStyle} handleClick={handleClick} />
    </>
  );
};
