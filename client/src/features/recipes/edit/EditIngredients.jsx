import React, { useEffect, useState } from "react";
import axios from "axios";

export const EditIngredients = ({ editIngredients, ingredients, recipe }) => {
  const [form, setForm] = useState([]);
  // TODO: make a Put for ingredients by recipe id
  const handleChange = (event, index) => {
    let tempForm = [...form];
    let tempIngredient = { ...tempForm[index] };
    tempIngredient.name = event.target.value;
    tempForm[index] = tempIngredient;
    setForm(tempForm);
  };

  const handleSubmit = () => {
    axios
      .put(`http://localhost:4000/ingredients/recipe/${recipe.id}`, form)
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => console.log(error.message));
  };

  useEffect(() => {
    setForm(ingredients);
  }, [ingredients]);
  return (
    <div className={editIngredients.class}>
      <form className="ingredients-form" onSubmit={handleSubmit}>
        {form &&
          form.map((ingredient, index) => (
            <input
              className="ingredients-input"
              key={ingredient.id}
              value={ingredient.name}
              onChange={(event) => handleChange(event, index)}
            />
          ))}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
