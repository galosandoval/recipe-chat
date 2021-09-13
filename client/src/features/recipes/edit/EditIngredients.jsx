import React, { useEffect, useState } from "react";
import axios from "axios";

const initialAddState = { open: false, class: "add-ingredient input" };

export const EditIngredients = ({ editIngredients, ingredients, recipe, getRecipeIngredients }) => {
  const [form, setForm] = useState([]);
  const [ingredientToAdd, setIngredientToAdd] = useState("");
  const [add, setAdd] = useState(initialAddState);
  
  const handleChange = (event, index) => {
    const { name, value } = event.target;
    if (name === "edit") {
      let tempForm = [...form];
      let tempIngredient = { ...tempForm[index] };
      tempIngredient.name = value;
      tempForm[index] = tempIngredient;
      setForm(tempForm);
    } else if (name === "add-ingredient") {
      let tempIngredient = [...ingredientToAdd];
      let tempObj = { ...tempIngredient[0] };
      tempObj.name = value;
      tempIngredient[0] = tempObj;
      setIngredientToAdd(tempIngredient);
    }
  };

  const handleClick = () => {
    add.open
      ? setAdd(initialAddState)
      : setAdd({ open: true, class: "add-ingredient input show-input" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { name } = document.activeElement;
    
    if (name === "edit") {
      axios
        .put(`http://localhost:4000/ingredients/recipe/${recipe.id}`, form)
        .then((res) => {
          console.log(res.data);
        })
        .catch((error) => console.log(error.message));
    } else if (name === "add") {
      const postBody = [
        {
          "recipe-id": recipe.id,
          name: ingredientToAdd,
          price: 100,
          measurement: "each",
          amount: 1
        }
      ];
      axios
        .post("http://localhost:4000/ingredients/", postBody)
        .then((res) => {
          console.log(res.data);
          getRecipeIngredients(recipe.id);
          setIngredientToAdd("");
        })
        .catch((error) => console.log(error.message));
    }
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
              name="edit"
            />
          ))}
        <div className={add.class}>
          <input
            type="text"
            value={ingredientToAdd}
            onChange={(event) => setIngredientToAdd(event.target.value)}
            name="add-ingredient"
            className="input"
            placeholder="Add an ingredient"
          />
        </div>
        {add.open ? (
          <button name="add" type="submit">
            Add
          </button>
        ) : (
          <button name="edit" type="submit">
            Save Changes
          </button>
        )}
        <button name="add-btn" onClick={handleClick}>
          {add.open ? "Cancel" : "+"}
        </button>
      </form>
    </div>
  );
};
