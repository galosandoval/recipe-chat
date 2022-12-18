import React, { useState } from "react";
import { checkSVG, xSVG } from "../../../styles/svgs";
import { useChangeRecipe } from "../../services/recipeService";

export const EditRecipe = ({
  editRecipe,
  recipe,
  setEditRecipe,
  initialEditCardState,
  handleClick
}) => {
  const recipeMutation = useChangeRecipe();
  const [show, setShow] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const formBody = {
      "recipe-name": formData.get("recipe-name"),
      "img-url": formData.get("img-url"),
      description: formData.get("description")
    };

    recipeMutation.mutate({ id: recipe.id, formBody });
    setShow(true);
    setTimeout(() => {
      setEditRecipe(initialEditCardState);
      setShow(false);
    }, 1000);
  };

  return (
    // className=edit-card > edit-card--show
    <div className={editRecipe.class}>
      <button
        className="edit-card-btn card-menu__btn btn-round"
        name="closedrop"
        onClick={handleClick}
      >
        {xSVG}
      </button>
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

        {recipeMutation.isSuccess && show ? (
          <button className="add-btn-submit">
            Recipe Saved<span className="add-btn-svg">{checkSVG}</span>
          </button>
        ) : (
          <button className="add-btn-submit">
            Save Changes <span className="add-btn-svg--hidden">{checkSVG}</span>
          </button>
        )}
      </form>
    </div>
  );
};
