import React, { useEffect, useState } from "react";
import { menuSVG } from "../../styles/svgs";
import { debounce } from "../utils/debounce";
import { NavLinks } from "./NavLinks";

export const Navbar = () => {
  const [visible, setVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

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
        <ul className="navbar__list navbar__list--phone">
          <button className="navbar__list-btn">{menuSVG}</button>
        </ul>
      </div>
    </>
  );
};
