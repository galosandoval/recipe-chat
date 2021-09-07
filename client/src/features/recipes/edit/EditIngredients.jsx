import React, { useEffect, useState } from "react";

export const EditIngredients = ({ editIngredients, ingredients }) => {
  const [form, setForm] = useState([]);
  // TODO: make a Put for ingredients by recipe id
  const handleChange = (event, index) => {
    let tempForm = [...form];
    let tempIngredient = { ...tempForm[index] };
    tempIngredient.name = event.target.value;
    tempForm[index] = tempIngredient;
    setForm(tempForm);
  };

  const handleSubmit = () => {};
  console.log("form", form);

  useEffect(() => {
    setForm(ingredients);
  }, [ingredients]);
  return (
    <div className={editIngredients.class}>
      <form onSubmit={handleSubmit}>
        {form &&
          form.map((ingredient, index) => (
            <input
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
