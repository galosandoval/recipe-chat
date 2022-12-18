import React, { useState } from "react";
import {
  useCreateIngredients,
  useCreateInstructions,
  useCreateRecipe
} from "../../services/recipeService";
import { queryClient } from "../../utils/react-query-client";
import { storage } from "../../utils/storage";
import { parseIngredients, parseInstructions } from "../../utils/addRecipe";

const initialRecipeToAddState = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: "",
  author: "",
  address: ""
};
const userId = storage.getUserId();

export const AddRecipe = () => {
  const recipe = useCreateRecipe();
  const instructions = useCreateInstructions();
  const ingredients = useCreateIngredients();

  const [recipeFormStyle, setRecipeFormStyle] = useState(0);
  const [count, setCount] = useState(0);
  const [formValues, setFormValues] = useState(initialRecipeToAddState);
  const [disabled, setDisabled] = useState(true);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((state) => ({ ...state, [name]: value }));
    setDisabled(false);
  };

  const handleNext = (event) => {
    const { name } = event.target;
    if (name === "next") {
      setCount((state) => state + 1);
      setRecipeFormStyle((state) => state - 100);
    }
    setDisabled(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const recipeBody = {
      "recipe-name": formValues.name,
      description: formValues.description,
      "user-id": userId,
      "img-url": formValues.imageUrl,
      author: formValues.author,
      address: formValues.address
    };

    await recipe.mutateAsync(recipeBody);
    const newRecipeId = queryClient.getQueryData(["recipe", { "user-id": storage.getUserId() }])
      .data.recipe[0];

    const parsedIngredients = parseIngredients(formValues.ingredients);
    const parsedInstructions = parseInstructions(formValues.instructions);
    const ingredientsBody = parsedIngredients.map((ingredientToAdd) => ({
      "recipe-id": newRecipeId,
      name: ingredientToAdd
    }));

    const instructionsBody = parsedInstructions.map((instruction, index) => ({
      "recipe-id": newRecipeId,
      description: instruction,
      step: index + 1
    }));

    await ingredients.mutateAsync(ingredientsBody);
    await instructions.mutateAsync(instructionsBody);

    setRecipeFormStyle(0);
    document.querySelector("#form").click();

    setTimeout(() => {
      recipe.reset();
      instructions.reset();
      ingredients.reset();
    }, 2000);
  };
  return (
    <form className="form-add">
      <div
        className="form-add__carousel"
        style={{
          transform: `translateX(${recipeFormStyle}%)`
        }}
      >
        <label className="form-add__label">
          Recipe Name
          <input
            required
            type="text"
            placeholder="Creamy Mushroom Toast With Soft Egg & Gruyère"
            name="name"
            className="form-container-recipe__input form-add__input"
            value={formValues.name}
            onChange={handleChange}
          />
        </label>
        <label className="form-add__label">
          Recipe Description
          <input
            required
            type="text"
            placeholder="A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner."
            name="description"
            className="form-container-recipe__input form-add__input"
            value={formValues.description}
            onChange={handleChange}
          />
        </label>
        <label className="form-add__label">
          Image Address
          <input
            required
            type="text"
            placeholder="https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage108081050-50-Mushroomtoast.jpg"
            name="imageUrl"
            className="form-container-recipe__input form-add__input"
            value={formValues.imageUrl}
            onChange={handleChange}
          />
        </label>
        <label className="form-add__label">
          Author
          <input
            required
            type="text"
            placeholder="Gordon Ramsay"
            name="author"
            className="form-container-recipe__input form-add__input"
            value={formValues.author}
            onChange={handleChange}
          />
        </label>
        <label className="form-add__label">
          Web Address
          <input
            required
            type="text"
            placeholder="https://www.gordonramsay.com/gr/recipes/mushroomtoast/"
            name="address"
            className="form-container-recipe__input form-add__input"
            value={formValues.address}
            onChange={handleChange}
          />
        </label>

        <label className="form-add__label">
          Ingredients
          <textarea
            required
            className="form-add__textarea"
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
        <label className="form-add__label">
          Instructions
          <textarea
            required
            className="form-add__textarea"
            name="instructions"
            cols="30"
            rows="10"
            placeholder="Make the Mushrooms: Heat a large skillet over medium-high heat and melt butter. Once melted, add mushrooms (working in batches if needed to not..."
            value={formValues.instructions}
            onChange={handleChange}
          />
        </label>
      </div>
      {count < 6 ? (
        <button
          onClick={handleNext}
          className="add-btn-submit form-add__btn"
          name="next"
          disabled={disabled}
        >
          Next
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className="add-btn-submit form-add__btn"
          type="submit"
          name="submit"
          disabled={disabled}
        >
          {recipe.isSuccess && instructions.isSuccess && ingredients.isSuccess
            ? "Success"
            : recipe.isLoading || instructions.isLoading || ingredients.isLoading
            ? "Adding..."
            : "Save"}
        </button>
      )}
    </form>
  );
};
