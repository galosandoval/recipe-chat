import React, { useEffect, useState } from "react";
import { useGetRecipes } from "../services/recipeService";
import { Loading } from "../status/Loading";
import { storage } from "../utils/storage";
import { AddGrocerylistCheckboxes } from "./AddGrocerylistCheckboxes";

export const AddGroceryListNew = () => {
  const { data: recipes, isLoading, isError, error } = useGetRecipes(storage.getUserId());
  const [checked, setChecked] = useState([]);
  const [grocerylistFormStyle, setRecipeFormStyle] = useState(0);
  const [count, setCount] = useState(0);

  const handleNext = (event) => {
    const { name } = event.target;
    if (name === "next") {
      setRecipeFormStyle((state) => state - 100);
      setCount((state) => state + 1);
    }
  };

  useEffect(() => {
    if (recipes) setChecked(() => new Array(recipes.length).fill(false));
  }, [recipes]);

  return (
    <>
      <form
        className="form-container-grocerylist"
        style={{
          transform: `translateX(${grocerylistFormStyle}%)`
        }}
      >
        <label className="form-container-grocerylist__label form-container-grocerylist__label-name">
          Name
          <input
            type="text"
            className="form-container-grocerylist__input"
            placeholder="Gordon Ramsay's Recipes"
            required
          />
        </label>
        <div className="form-container-grocerylist__checkboxes">
          {isLoading || checked.length === 0 ? (
            <Loading />
          ) : (
            recipes.map((r, i) => (
              <AddGrocerylistCheckboxes
                r={r}
                index={i}
                checked={checked}
                setChecked={setChecked}
                key={r.id}
              />
            ))
          )}
        </div>
      </form>
      {count === 1 ? (
        <button
          onClick={handleNext}
          className="form-container-grocerylist__btn add-btn-submit"
          type="submit"
          name="submit"
        >
          Save
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="form-container-grocerylist__btn add-btn-submit"
          type="submit"
          name="next"
        >
          Next
        </button>
      )}
    </>
  );
};
