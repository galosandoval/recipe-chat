import React, { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { menuSVG, xSVG } from "../../styles/svgs";
import { useDeleteRecipe } from "../services/recipeService";
import { DeleteConfirmation } from "./delete/DeleteConfirmation";

const initialDeleteModalState = {
  isOpen: false,
  className: "delete-confirmation delete-confirmation--hidden"
};

export const CardMenu = ({
  dropdown,
  handleClick,
  editRecipe,
  editInstructions,
  editIngredients,
  setDropdown,
  initialDropdownState,
  recipe
}) => {
  const [toBeDeleted, setToBeDeleted] = useState(null);
  const [deleteModal, setDeleteModal] = useState(initialDeleteModalState);
  const deleteMutation = useDeleteRecipe(recipe.id);

  const handleOutsideClick = () => {
    setDropdown(initialDropdownState);
  };

  const handleCloseMenu = () => {
    setDropdown(initialDropdownState);
  };

  const handleDelete = () => {
    const modal = document.querySelector("body");

    setToBeDeleted(recipe);
    console.log({ toBeDeleted });
    modal.classList.add("modal-blur");

    setDeleteModal({ isOpen: true, className: "delete-confirmation" });
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
      {/* classname=card-menu__content > card-menu__content--show */}
      <div className={dropdown.class}>
        <button className="card-menu__btn-description" name="desc-btn" onClick={handleClick}>
          Edit Description
        </button>
        <button
          className="card-menu__btn-instruction"
          name="instructions-btn"
          onClick={handleClick}
        >
          Edit Instructions
        </button>
        <button className="card-menu__btn-ingredients" name="ingredients-btn" onClick={handleClick}>
          Edit Ingredients
        </button>
        <button className="card-menu__btn-delete" name="delete-recipe" onClick={handleDelete}>
          Delete
        </button>
      </div>
      <DeleteConfirmation
        deleteModal={deleteModal}
        name="recipe"
        setDeleteModal={setDeleteModal}
        toBeDeleted={toBeDeleted}
        initialDeleteModalState={initialDeleteModalState}
        mutation={deleteMutation}
      />
    </div>
  );
};
