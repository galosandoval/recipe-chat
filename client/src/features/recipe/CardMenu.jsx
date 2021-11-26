import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { menuSVG, xSVG } from "../../styles/svgs";

export const CardMenu = ({
  dropdown,
  handleClick,
  editRecipe,
  editInstructions,
  editIngredients,
  setDropdown,
  initialDropdownState
}) => {
  const handleOutsideClick = () => {
    setDropdown(initialDropdownState);
  };

  const handleCloseMenu = () => {
    setDropdown(initialDropdownState);
  };

  return (
    <div className="card-menu">
      <OutsideClickHandler onOutsideClick={handleOutsideClick}>
        {editRecipe.open || editInstructions.open || editIngredients.open ? (
          <button
            name="closedrop"
            className="btn-round card-menu__btn card-menu__btn-closedrop"
            onClick={handleClick}
          >
            {xSVG}
          </button>
        ) : dropdown.open ? (
          <button
            className="btn-round card-menu__btn card-menu__btn-dropdown"
            onClick={handleCloseMenu}
            name="closedrop"
          >
            {xSVG}
          </button>
        ) : (
          <button
            className="btn-round card-menu__btn card-menu__btn-dropdown"
            name="dropbtn"
            onClick={handleClick}
          >
            {menuSVG}
          </button>
        )}
      </OutsideClickHandler>
      <div className={dropdown.class}>
        <button className="card-menu__edit-btn" name="desc-btn" onClick={handleClick}>
          Edit Description
        </button>
        <button
          className="card-menu__instructions-btn"
          name="instructions-btn"
          onClick={handleClick}
        >
          Edit Instructions
        </button>
        <button className="card-menu__ingredients-btn" name="ingredients-btn" onClick={handleClick}>
          Edit Ingredients
        </button>
      </div>
    </div>
  );
};
