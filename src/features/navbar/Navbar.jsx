import React, { useEffect, useState } from "react";
import { menuSVG, xSVG } from "../../styles/svgs";
import { debounce } from "../utils/debounce";
import { NavLinks } from "./NavLinks";
import { Sidebar } from "./Sidebar";

const initialSidebarState = {
  transform: "translateY(-100%)"
};

export const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarStyle, setSidebarStyle] = useState(initialSidebarState);

  const handleSidebar = () => {
    // const modal = document.querySelector("body");
    // const sidebar = document.querySelector(".navbar__sidebar");
    // if (sidebarVisible) {
    //   modal.classList.remove("modal-blur");
    //   sidebar.classList.add("navbar__sidebar--hidden");
    // } else {
    //   sidebar.classList.remove("navbar__sidebar--hidden");
    //   modal.classList.add("modal-blur");
    // }

    const circles = document.querySelectorAll(".carousel__circles");
    const arrows = document.querySelectorAll(".carousel__buttons");

    console.log({ circles });

    if (sidebarVisible) {
      console.log("showem");
      setTimeout(() => {
        circles.forEach((c) => (c.style.zIndex = 1));
        arrows.forEach((c) => (c.style.zIndex = 1));
      }, 800);
      setSidebarVisible(false);
      setSidebarStyle(initialSidebarState);
    } else {
      console.log("dont showem");
      circles.forEach((c) => (c.style.zIndex = 0));
      arrows.forEach((c) => (c.style.zIndex = 0));
      setSidebarVisible(true);
      setSidebarStyle({ transform: "translateY(0)" });
    }
  };

  const handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;

    setVisible(
      (prevScrollPos > currentScrollPos && prevScrollPos - currentScrollPos > 70) ||
        currentScrollPos < 10
    );

    setPrevScrollPos(currentScrollPos);
  }, 100);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, visible, handleScroll]);
  return (
    <>
      <div className="navbar navbar--hidden">
        <h1 className="navbar__logo logo">listy</h1>
        <ul className="navbar__list navbar__list--default">
          <NavLinks />
        </ul>
        <div className="navbar__list navbar__list--phone">
          <input type="checkbox" className="navbar__checkbox" id="nav-toggle" />
          <label onClick={handleSidebar} className="navbar__list-btn" htmlFor="nav-toggle">
            {sidebarVisible ? xSVG : menuSVG}
          </label>
          <div className="navbar__background">{""}</div>
        </div>
        <Sidebar sidebarStyle={sidebarStyle} />
      </div>
    </>
  );
};
