import React, { useState } from "react";
import { checkSVG } from "../../../styles/svgs";
import { queryClient } from "../../utils/react-query-client";
import {
  useCreateIngredients,
  useCreateInstructions,
  useCreateRecipe
} from "../../services/recipeService";
import { parseIngredients, parseInstructions } from "./addRecipe";
import { storage } from "../../utils/storage";

const initialRecipeToAddState = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: "",
  author: "",
  address: ""
};
export const NewAddRecipe = () => {
  const [recipeFormStyle, setRecipeFormStyle] = useState(0);
  const [count, setCount] = useState(0);
  const [formValues, setFormValues] = useState(initialRecipeToAddState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((state) => ({ ...state, [name]: value }));
  };

  const handleNext = (event) => {
    const { name } = event.target;
    if (name === "next") {
      setCount((state) => state + 1);
      setRecipeFormStyle((state) => state - 100);
    }
    if (name === "submit") {
    }
  };
  return (
    <>
      <form
        className="form-container-recipe"
        style={{
          transform: `translateX(${recipeFormStyle}%)`
        }}
      >
        <label className="form-container-recipe__label form-container-recipe__label--name">
          Recipe Name
          <input
            required
            type="text"
            placeholder="Creamy Mushroom Toast With Soft Egg & Gruyère"
            name="name"
            className="form-container-recipe__input"
            value={formValues.name}
            onChange={handleChange}
          />
        </label>
        <label className="form-container-recipe__label">
          Recipe Description
          <input
            required
            type="text"
            placeholder="A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner."
            name="description"
            className="form-container-recipe__input"
            value={formValues.description}
            onChange={handleChange}
          />
        </label>
        <label className="form-container-recipe__label">
          Image Address
          <input
            required
            type="text"
            placeholder="https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage108081050-50-Mushroomtoast.jpg"
            name="imageUrl"
            className="form-container-recipe__input"
            value={formValues.imageUrl}
            onChange={handleChange}
          />
        </label>
        <label className="form-container-recipe__label">
          Author
          <input
            required
            type="text"
            placeholder="Gordon Ramsay"
            name="author"
            className="form-container-recipe__input"
            value={formValues.author}
            onChange={handleChange}
          />
        </label>
        <label className="form-container-recipe__label">
          Web Address
          <input
            required
            type="text"
            placeholder="https://www.gordonramsay.com/gr/recipes/mushroomtoast/"
            name="address"
            className="form-container-recipe__input"
            value={formValues.address}
            onChange={handleChange}
          />
        </label>

        <label className="form-container-recipe__label form-container-recipe__label-textarea">
          Ingredients
          <textarea
            required
            className="form-container-recipe__textarea"
            name="ingredients"
            cols="30"
            rows="10"
            placeholder="2 tablespoons unsalted butter
              8 ounces mushrooms
              3 cloves garlic, smashed
              3 large sprigs of thyme
              ½ shallot..."
            value={formValues.ingredients}
            onChange={handleChange}
          />
        </label>
        <div className="form-container-recipe__submit">
          <label className="form-container-recipe__label form-container-recipe__label-textarea">
            Instructions
            <textarea
              required
              className="form-container-recipe__textarea"
              name="instructions"
              cols="30"
              rows="10"
              placeholder="Make the Mushrooms: Heat a large skillet over medium-high heat and melt butter. Once melted, add mushrooms (working in batches if needed to not..."
              value={formValues.instructions}
              onChange={handleChange}
            />
          </label>
        </div>
      </form>
      {count < 6 ? (
        <button
          onClick={handleNext}
          className="add-btn-submit form-container-recipe__btn-next"
          type="submit"
          name="next"
        >
          Next
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="add-btn-submit form-container-recipe__btn-next"
          type="submit"
          name="submit"
        >
          Save
        </button>
      )}
    </>
  );
};
