import axios from "axios";
import React, { useState } from "react";
import { parseIngredients, parseInstructions } from "./utils/addRecipe";

const initialTextAreaState = {
  name: "",
  description: "",
  ingredients: "",
  instructions: "",
  imageUrl: ""
};

export const AddRecipe = ({ recipes }) => {
  const [recipeToAdd, SetRecipetToAdd] = useState(initialTextAreaState);

  const handleChange = (event) => {
    const { name } = event.target;
    SetRecipetToAdd({ ...recipeToAdd, [name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const recipeBody = {
      "recipe-name": recipeToAdd.name,
      description: recipeToAdd.description,
      "user-id": recipes["user-id"],
      "img-url": recipeToAdd.imageUrl
    };
    const parsedInstructions = parseInstructions(recipeToAdd.instructions);
    const parsedIngredients = parseIngredients(recipeToAdd.ingredients);
    console.log("ingredients", parsedIngredients);
    console.log("instructions", parsedInstructions);
    // axios
    //   .post("http://localhost:4000/recipes/", recipeBody)
    //   .then((recipeAdded) => {
    //     console.log(recipeAdded.data.recipe[0]);
    //     recipeId = recipeAdded.data.recipe[0];
    //   })
    //   .then(() => {
    //     console.log(recipeId);
    //     axios.post("http://localhost:4000/instructions/", instructionsBody);
    //   });
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
      <textarea
        className="recipes-text-area"
        name="ingredients"
        cols="30"
        rows="10"
        placeholder="Paste recipe ingredients here!"
        value={recipeToAdd.ingredients}
        onChange={handleChange}
      />
      <textarea
        className="recipes-text-area"
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
