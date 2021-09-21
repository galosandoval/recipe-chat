import axios from "axios";
import React, { useState } from "react";

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
      // TODO: Hard coded with 1, replace with user-id
      "user-id": 1,
      "img-url": recipeToAdd.imageUrl
    };

    let newLine = "STEP ";
    console.log("newline", newLine.split("\n"));
    let instructionsBody = recipeToAdd.instructions.split(" ");
    let instructions = [];
    let instruction = [];
    let count = 0;
    for (let i = 0; i < instructionsBody.length + count; i++) {
      if (instructionsBody[i]?.includes("\n")) {
        let toAdd = instructionsBody[i].split("\n");

        instruction.push(toAdd[0]);

        if (instruction.length > 2) instructions.push(instruction);

        instruction = [];

        if (toAdd.length === 3) instruction.push(toAdd[2]);
        else if (toAdd.length === 4) instruction.push(toAdd[3]);
        else instruction.push(toAdd[1]);

        count++;
        continue;
      }

      if (instructionsBody[i] !== undefined) instruction.push(instructionsBody[i]);

      if (instructionsBody.length === i) instructions.push(instruction);
    }

    // TODO: Figure out how to add a recipeID to the recipe body

    console.log("instruction body", instructionsBody);
    console.log("instruction body", instructions);
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
