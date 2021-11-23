import React, { useState } from "react";
import { addSVG, checkSVG } from "../../../utils/svgs";
import { Loading } from "../../Loading";
import { useChangeInstructions, useCreateInstructions } from "../../services/instructionsService";
import { useGetInstructions } from "../../services/recipes";
import { DeleteItem } from "../delete/DeleteItem";

const addInitialState = {
  open: false,
  class: "recipe-form__input recipe-form__add-input"
};

export const EditInstructions = ({
  editInstructions,
  recipe,
  setEditInstructions,
  initialEditInstructionsState
}) => {
  const changeMutation = useChangeInstructions(recipe.id);
  const createMutation = useCreateInstructions(recipe.id);
  const { data: instructions, isLoading } = useGetInstructions(recipe.id);

  const [add, setAdd] = useState(addInitialState);

  const handleClick = (event) => {
    event.preventDefault();
    add.open
      ? setAdd(addInitialState)
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
      const formBody = instructions.map((input) => ({
        id: input.id,
        "recipe-id": input["recipe-id"],
        description: formData.get(`${input.id}`),
        step: input.step
      }));

      changeMutation.mutate({ id: recipe.id, formBody });
      setTimeout(() => {
        setEditInstructions(initialEditInstructionsState);
      }, 1000);
    } else if (name === "add") {
      const formBody = [
        {
          description: formData.get("add-instruction"),
          "recipe-id": recipe.id,
          step: instructions.length + 1
        }
      ];

      const inputToClear = document.querySelector(".recipe-form__input .edit-instructions__input");
      inputToClear.value = "";
      createMutation.mutate(formBody);
    }
  };

  return (
    <div className={editInstructions.class}>
      <form className="recipe-form edit-instructions" onSubmit={handleSubmit}>
        <div className="instructions">
          {isLoading ? (
            <Loading />
          ) : (
            instructions.map((instruction) => (
              <div key={instruction.id}>
                <input
                  className="recipe-form__input edit-instruction__input"
                  type="text"
                  defaultValue={instruction.description}
                  name={instruction.id}
                />
                <DeleteItem api={"http://localhost:4000/instructions/"} id={instruction.id} />
              </div>
            ))
          )}
        </div>
        <div className={add.class}>
          <input
            type="text"
            name="add-instruction"
            className="recipe-form__input edit-instructions__input"
            placeholder="Add an instruction"
          />
        </div>
        {add.open ? (
          <button className="add-btn-submit" name="add" type="submit">
            Add
          </button>
        ) : changeMutation.isSuccess ? (
          <button className="add-btn-submit">
            Recipe Saved<span className="add-btn-svg">{checkSVG}</span>
          </button>
        ) : (
          <button name="edit" type="submit" className="add-btn-submit">
            Save Changes <span className="add-btn-svg--hidden">{checkSVG}</span>
          </button>
        )}
        <button name="add-btn" className="add-btn-submit recipe-form__btn" onClick={handleClick}>
          {add.open ? "Done" : addSVG}
        </button>
      </form>
    </div>
  );
};
