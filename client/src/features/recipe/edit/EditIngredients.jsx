import React, { useEffect, useState } from "react";
import axios from "axios";
import { DeleteItem } from "../delete/DeleteItem";
import { useGetIngredients } from "../../services/recipes";
import { Loading } from "../../Loading";

const initialAddState = { open: false, class: "recipe-form__input recipe-form__add-input" };

export const EditIngredients = ({ editIngredients, recipe, getRecipeIngredients }) => {
  const { data: ingredients, isLoading: ingredientsIsLoading } = useGetIngredients(recipe.id);

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
      : setAdd({
          open: true,
          class: "recipe-form__input recipe-form__add-input recipe-form__add-input--show"
        });
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
  if (ingredientsIsLoading) return <Loading />;
  return (
    <div className={editIngredients.class}>
      <form className="recipe-form edit-ingredients" onSubmit={handleSubmit}>
        {form &&
          form.map((ingredient, index) => (
            <div key={ingredient.id}>
              <input
                className="recipe-form__input edit-ingredients__input"
                value={ingredient.name}
                onChange={(event) => handleChange(event, index)}
                name="edit"
              />
              <DeleteItem
                api={"http://localhost:4000/ingredients/"}
                id={ingredient.id}
                getItem={getRecipeIngredients}
                itemId={recipe.id}
              />
            </div>
          ))}
        <div className={add.class}>
          <input
            type="text"
            value={ingredientToAdd}
            onChange={(event) => setIngredientToAdd(event.target.value)}
            name="add-ingredient"
            className="recipe-form__input"
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
