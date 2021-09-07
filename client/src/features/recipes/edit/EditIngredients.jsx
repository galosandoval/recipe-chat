import React, { useEffect, useState } from "react";

export const EditIngredients = ({ editIngredients, ingredients }) => {
  const [form, setForm] = useState([]);
  // TODO: First make a Put for ingredients by recipe id
  console.log("ingredients", ingredients);
  const handleChange = () => {};

  const handleSubmit = () => {};
  console.log("form", form);

  useEffect(() => {
    setForm(ingredients);
  }, [ingredients]);
  return (
    <div className={editIngredients.class}>
      <form onSubmit={handleSubmit}>
        {form &&
          form.map((ingredient) => (
            <input key={ingredient.id} value={ingredient.name} onChange={handleChange} />
          ))}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
