import axios from "axios";
import React, { useState } from "react";

const initialFormState = (recipe) => ({
  "recipe-name": recipe["recipe-name"],
  "img-url": recipe["img-url"] || "",
  description: recipe.description
});
export const EditRecipe = ({ editRecipe, recipe }) => {
  const [form, setForm] = useState(initialFormState(recipe));

  const handleSubmit = () => {
    axios
      .put(`http://localhost:4000/recipes/${recipe.id}`, form)
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => console.log(error));
  };

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  return (
    <div className={editRecipe.class}>
      <form onSubmit={handleSubmit}>
        <input type="text" name="recipe-name" onChange={handleChange} value={form["recipe-name"]} />
        <input type="text" name="img-url" onChange={handleChange} value={form["img-url"]} />
        <input type="text" name="description" onChange={handleChange} value={form.description} />
        <button type="submit">Save Changes</button>
      </form>
      <p>Edit Recipe</p>
    </div>
  );
};
