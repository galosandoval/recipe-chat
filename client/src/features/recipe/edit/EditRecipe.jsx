import axios from "axios";
import React, { useState } from "react";

const initialFormState = (recipe) => ({
  "recipe-name": recipe["recipe-name"],
  "img-url": recipe["img-url"] || "",
  description: recipe.description
});
export const EditRecipe = ({ editRecipe, recipe }) => {
  const [form, setForm] = useState(initialFormState(recipe));

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = () => {
    axios
      .put(`http://localhost:4000/recipes/${recipe.id}`, form)
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className={editRecipe.class}>
      <form className="edit-recipe-form recipe-form edit-recipe" onSubmit={handleSubmit}>
        <input
          className="recipe-form__input edit-recipe__input"
          placeholder="Recipe Name"
          type="text"
          name="recipe-name"
          onChange={handleChange}
          value={form["recipe-name"]}
        />
        <input
          className="recipe-form__input edit-recipe__input"
          placeholder="Image URL"
          type="text"
          name="img-url"
          onChange={handleChange}
          value={form["img-url"]}
        />
        <textarea
          style={{ resize: "none" }}
          cols={35}
          rows={10}
          className="recipe-form__input edit-recipe__input"
          placeholder="Description"
          type="text"
          name="description"
          onChange={handleChange}
          value={form.description}
        />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
