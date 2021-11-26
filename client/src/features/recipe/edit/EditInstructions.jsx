import React, { useState } from "react";
import { addSVG } from "../../../styles/svgs";
import { Loading } from "../../status/Loading";
import {
  useChangeInstructions,
  useCreateInstructions,
  useRemoveInstruction
} from "../../services/instructionsService";
import { useGetInstructions } from "../../services/recipes";
import { AddButton } from "../../shared/AddButton";
import { DeleteConfirmation } from "../delete/DeleteConfirmation";
import { DeleteItem } from "../delete/DeleteItem";

const addInitialState = {
  open: false,
  class: "recipe-form__input recipe-form__add-input"
};
const initialDeleteModalState = {
  isOpen: false,
  className: "delete-confirmation delete-confirmation--hidden"
};

export const EditInstructions = ({
  editInstructions,
  recipe,
  setEditInstructions,
  initialEditInstructionsState
}) => {
  const { data: instructions, isLoading } = useGetInstructions(recipe.id);
  const changeMutation = useChangeInstructions(recipe.id);
  const createMutation = useCreateInstructions(recipe.id);
  const removeMutation = useRemoveInstruction(recipe.id);

  const [add, setAdd] = useState(addInitialState);
  const [deleteModal, setDeleteModal] = useState(initialDeleteModalState);
  const [toBeDeleted, setToBeDeleted] = useState(null);

  const handleClick = (event) => {
    event.preventDefault();
    add.open
      ? setAdd(addInitialState)
      : setAdd({
          open: true,
          class: "recipe-form__input recipe-form__add-input recipe-form__add-input--show"
        });
  };

  const handleSubmit = async (event) => {
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

      await changeMutation.mutateAsync({ id: recipe.id, formBody });
      await setTimeout(() => {
        setEditInstructions(initialEditInstructionsState);
        changeMutation.reset();
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
      await createMutation.mutateAsync(formBody);
      setTimeout(() => {
        createMutation.reset();
      }, 1000);
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
              <div className="recipe-form__input-container" key={instruction.id}>
                <input
                  className="recipe-form__input edit-instruction__input"
                  type="text"
                  defaultValue={instruction.description}
                  name={instruction.id}
                />
                <DeleteItem
                  setToBeDeleted={setToBeDeleted}
                  instruction={instruction}
                  deleteModal={deleteModal}
                  setDeleteModal={setDeleteModal}
                  initialDeleteModalState={initialDeleteModalState}
                />
              </div>
            ))
          )}
          <DeleteConfirmation
            name="instruction"
            deleteModal={deleteModal}
            setDeleteModal={setDeleteModal}
            toBeDeleted={toBeDeleted}
            mutation={removeMutation}
            initialDeleteModalState={initialDeleteModalState}
          />
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
          <AddButton
            defaultValue="Add"
            mutation={createMutation}
            name="add"
            type="submit"
            className={null}
          />
        ) : (
          <AddButton
            name="edit"
            defaultValue="Save Changes"
            mutation={changeMutation}
            type="submit"
          />
        )}
        <button name="add-btn" className="add-btn-submit recipe-form__btn" onClick={handleClick}>
          {add.open ? "Done" : addSVG}
        </button>
      </form>
    </div>
  );
};
