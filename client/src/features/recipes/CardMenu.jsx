import React, { useEffect, useRef } from "react";
import OutsideClickHandler from "react-outside-click-handler";

export const CardMenu = ({
  dropdown,
  handleClick,
  editRecipe,
  editInstructions,
  editIngredients,
  setDropdown,
  initialDropdownState
}) => {
  const wrapperRef = useRef(null);

  const svg = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
    </svg>
  );

  const handleOutsideClick = () => {
    setDropdown(initialDropdownState);
  };

  const handleCloseMenu = () => {
    setDropdown(initialDropdownState);
  };

  // useEffect(() => {
  //   const handleClickOutside = (event, ref) => {
  //     console.log('name out of IF', event.target.name);
  //     if (
  //       ref.current &&
  //       !ref.current.contains(event.target) &&
  //       event.target.name !== "closedrop" &&
  //       event.target.name !== "dropbtn"
  //       // ref.current.className !== "dropdown-content show-edit-menu"
  //     ) {
  //       // if (event.currentTarget.className === undefined) {
  //       // }
  //       console.log("name", event.target.name);
  //       console.log("classname", event.target.className);
  //       setDropdown(initialDropdownState);
  //       // TODO: Fix close button
  //       // console.log("tartget", event.currentTarget.className);
  //       // setTimeout(() => {
  //       //   setDropdown(initialDropdownState);
  //       // }, 500);
  //     }
  //     if (event.target.name === "closedrop") {
  //       setDropdown(initialDropdownState);
  //     }
  //   };

  //   document.addEventListener("mousedown", (event) => handleClickOutside(event, wrapperRef));

  //   return () => {
  //     document.removeEventListener("mousedown", (event) => handleClickOutside(event, wrapperRef));
  //   };
  // }, [initialDropdownState, setDropdown]);

  return (
    <div className="dropdown">
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        {editRecipe.open || editInstructions.open || editIngredients.open ? (
          <button className="closebtn" onClick={handleClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
            </svg>
          </button>
        ) : dropdown.open ? (
          <button className="dropbtn" onClick={handleCloseMenu} name="closedrop">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
            </svg>
          </button>
        ) : (
          <button className="dropbtn" name="dropbtn" onClick={handleClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path d="M6 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
            </svg>
          </button>
        )}
      </OutsideClickHandler>
      <div className={dropdown.class} ref={wrapperRef}>
        <button className="edit" onClick={handleClick}>
          Edit Description
        </button>
        <button className="instructions" onClick={handleClick}>
          Edit Instructions
        </button>
        <button className="ingredients" onClick={handleClick}>
          Edit Ingredients
        </button>
      </div>
    </div>
  );
};
