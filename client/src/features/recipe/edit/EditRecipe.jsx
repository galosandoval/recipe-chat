import axios from "axios";
import React, { useState } from "react";
import { queryClient } from "../../services/react-query-client";
import { useChangeRecipe } from "../../services/recipes";

const initialFormState = (recipe) => ({
  "recipe-name": recipe["recipe-name"],
  "img-url": recipe["img-url"] || "",
  description: recipe.description
});
export const EditRecipe = ({ editRecipe, recipe, handleClick }) => {
  const recipeMutation = useChangeRecipe();

  // const [form, setForm] = useState(initialFormState(recipe));

  // const handleChange = (event) => {
  //   setForm({ ...form, [event.target.name]: event.target.value });
  // };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formBody = {
      "recipe-name": formData.get("recipe-name"),
      "img-url": formData.get("img-url"),
      description: formData.get("description")
    };

    recipeMutation.mutate({ id: recipe.id, formBody });
  };

  return (
    <div className={editRecipe.class}>
      <form className="edit-recipe-form recipe-form edit-recipe" onSubmit={handleSubmit}>
        <input
          className="recipe-form__input edit-recipe__input"
          placeholder="Recipe Name"
          type="text"
          name="recipe-name"
          defaultValue={recipe["recipe-name"]}
        />
        <input
          className="recipe-form__input edit-recipe__input"
          placeholder="Image URL"
          type="text"
          name="img-url"
          defaultValue={recipe["img-url"] || ""}
        />
        <textarea
          style={{ resize: "none" }}
          cols={35}
          rows={10}
          className="recipe-form__input edit-recipe__input"
          placeholder="Description"
          type="text"
          name="description"
          defaultValue={recipe.description}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
