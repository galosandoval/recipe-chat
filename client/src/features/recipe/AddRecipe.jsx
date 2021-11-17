import axios from "axios";
import React, { useState } from "react";
import { parseIngredients, parseInstructions } from "./utils/addRecipe";

const initialRecipeToAddState = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: ""
};

export const AddRecipe = ({ recipes, getRecipes }) => {
  const [recipeToAdd, setRecipetToAdd] = useState(initialRecipeToAddState);

  const handleChange = (event) => {
    const { name } = event.target;
    setRecipetToAdd({ ...recipeToAdd, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const recipeBody = {
      "recipe-name": recipeToAdd.name,
      description: recipeToAdd.description,
      "user-id": recipes[0]["user-id"],
      "img-url": recipeToAdd.imageUrl
    };

    const parsedIngredients = parseIngredients(recipeToAdd.ingredients);
    console.log("parsedIngredients: ", parsedIngredients);
    const parsedInstructions = parseInstructions(recipeToAdd.instructions);

    let newRecipeId;

    axios
      .post("http://localhost:4000/recipes/", recipeBody)
      .then((recipeAdded) => {
        newRecipeId = recipeAdded.data.recipe[0];
      })
      .catch((err) => console.log(err))
      .then(() => {
        const ingredientsBody = parsedIngredients.map((ingredientToAdd) => ({
          "recipe-id": newRecipeId,
          name: ingredientToAdd
        }));

        axios
          .post("http://localhost:4000/ingredients/", ingredientsBody)
          .then((res) => console.log(res.data))
          .catch((err) => console.log(err));
      })
      .then(() => {
        const instructionsBody = parsedInstructions.map((instruction, index) => ({
          "recipe-id": newRecipeId,
          description: instruction,
          step: index + 1
        }));
        axios
          .post("http://localhost:4000/instructions/", instructionsBody)
          .then((res) => {
            getRecipes(recipes[0]["user-id"]);
            setRecipetToAdd(initialRecipeToAddState);
          })
          .catch((err) => console.log(err));
      });
  };
  return (
    <form className="add-recipe" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Recipe Name"
        name="name"
        value={recipeToAdd.name}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="Recipe Description"
        name="description"
        value={recipeToAdd.description}
        onChange={handleChange}
      />
      <input
        type="text"
        placeholder="Image URL"
        name="imageUrl"
        value={recipeToAdd.imageUrl}
        onChange={handleChange}
      />
      {/**
       * TODO: Add text to placeholder so it
       * looks like a recipe is being added
       * maybe add input then change placeholder
       * to solely have the recipe
       */}
      <textarea
        className="add-recipe__textarea"
        name="ingredients"
        cols="30"
        rows="10"
        placeholder="Paste recipe ingredients here!"
        value={recipeToAdd.ingredients}
        onChange={handleChange}
      />
      <textarea
        className="add-recipe__textarea"
        name="instructions"
        cols="30"
        rows="10"
        placeholder="Paste recipe intructions here!"
        value={recipeToAdd.instructions}
        onChange={handleChange}
      />
      <button type="submit">Add Recipe</button>
    </form>
  );
};
