import React, { useState } from "react";
import { DeleteItem } from "../delete/DeleteItem";
import { useGetIngredients } from "../../services/recipeService";
import { Loading } from "../../status/Loading";
import { useChangeIngredients, useCreateIngredients } from "../../services/ingredientsService";
import { addSVG, checkSVG } from "../../../styles/svgs";
import { AddButton } from "../../recipe/create/AddButton";

const initialAddState = { open: false, class: "recipe-form__input recipe-form__add-input" };

export const EditIngredients = ({
  editIngredients,
  recipe,
  setEditIngredients,
  initialEditIngredientsState
}) => {
  const { data: ingredients, isLoading } = useGetIngredients(recipe.id);
  const changeMutation = useChangeIngredients(recipe.id);
  const createMutation = useCreateIngredients(recipe.id);

  const [add, setAdd] = useState(initialAddState);

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
    const formData = new FormData(event.target);

    if (name === "edit") {
      const formBody = ingredients.map((i) => ({
        name: formData.get(`${i.id}`),
        id: i.id,
        "recipe-id": i["recipe-id"]
      }));

      changeMutation.mutate({ id: recipe.id, formBody });
      setTimeout(() => {
        setEditIngredients(initialEditIngredientsState);
      }, 1000);
    } else if (name === "add") {
      const formBody = [
        {
          "recipe-id": recipe.id,
          name: formData.get("add-ingredient")
        }
      ];

      const inputToClear = document.querySelector(".recipe-form__input--add-ingredient");
      inputToClear.value = "";
      createMutation.mutate(formBody);
      console.log({ formBody });
    }
  };
  return (
    // classname=edit-card edit-card--show
    <div className={editIngredients.class}>
      <form className="recipe-form edit-ingredients" onSubmit={handleSubmit}>
        {isLoading ? (
          <Loading />
        ) : (
          ingredients.map((ingredient) => (
            <div className="recipe-form__input-container" key={ingredient.id}>
              <input
                className="recipe-form__input edit-ingredients__input"
                defaultValue={ingredient.name}
                name={ingredient.id}
              />
              <DeleteItem api={"http://localhost:4000/ingredients/"} id={ingredient.id} />
            </div>
          ))
        )}
        <div className={add.class}>
          <input
            type="text"
            name="add-ingredient"
            className="recipe-form__input recipe-form__input--add-ingredient"
            placeholder="Add an ingredient"
          />
        </div>
        {add.open ? (
          <AddButton name="add" type="submit" mutation={changeMutation} defaultValue="Add" />
        ) : changeMutation.isSuccess ? (
          <button className="add-btn-submit">
            Recipe Saved<span className="add-btn-svg">{checkSVG}</span>
          </button>
        ) : (
          <button name="edit" type="submit" className="add-btn-submit">
            Save Changes <span className="add-btn-svg--hidden">{checkSVG}</span>
          </button>
        )}
        <button className="add-btn-submit recipe-form__btn" name="add-btn" onClick={handleClick}>
          {add.open ? "Done" : addSVG}
        </button>
      </form>
    </div>
  );
};
