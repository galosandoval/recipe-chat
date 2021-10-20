import React, { useEffect, useRef } from "react";

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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        event.target.className !== ("edit" || "instructions" || "ingredients")
      ) {
        setDropdown(initialDropdownState);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [initialDropdownState, setDropdown]);
  return (
    <div className="dropdown" onClick={handleClick}>
      {editRecipe.open || editInstructions.open || editIngredients.open ? (
        <button onClick={handleClick} className="closebtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M23.954 21.03l-9.184-9.095 9.092-9.174-2.832-2.807-9.09 9.179-9.176-9.088-2.81 2.81 9.186 9.105-9.095 9.184 2.81 2.81 9.112-9.192 9.18 9.1z" />
          </svg>
        </button>
      ) : (
        <button className="dropbtn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M6 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm9 0c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" />
          </svg>
        </button>
      )}
      <div className={dropdown.class} ref={wrapperRef}>
        <button className="edit" onClick={handleClick}>
          Edit Recipe Description
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
