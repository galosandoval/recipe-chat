import axios from "axios";
import React, { useEffect, useState } from "react";
import { queryClient } from "../../services/react-query-client";
import { DeleteItem } from "../delete/DeleteItem";

const addInitialState = {
  open: false,
  class: "recipe-form__input recipe-form__add-input"
};

const instructionInitialState = [
  {
    "recipe-id": null,
    description: "",
    step: null
  }
];

export const EditInstructions = ({
  editInstructions,
  instructions,
  getRecipeInstructions,
  recipe
}) => {
  const [form, setForm] = useState([]);
  const [instructionToAdd, setInstructionToAdd] = useState(instructionInitialState);
  const [add, setAdd] = useState(addInitialState);

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    if (name === "edit-description") {
      let tempForm = [...form];
      let tempInstruction = { ...tempForm[index] };
      tempInstruction.description = value;
      tempForm[index] = tempInstruction;
      setForm(tempForm);
    }
    if (name === "add-instruction") {
      let tempForm = [...instructionToAdd];
      let tempObj = { ...tempForm[0] };
      tempObj.description = value;
      tempObj["recipe-id"] = recipe.id;
      tempObj.step = form.length + 1;
      tempForm[0] = tempObj;
      setInstructionToAdd(tempForm);
    }
  };

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

    if (name === "edit") {
      axios
        .put(`http://localhost:4000/instructions/${form[0]["recipe-id"]}`, form)
        .then((res) => {
          console.log("edit", res.data);
          // getRecipeInstructions(form[0]["recipe-id"]);
          queryClient.invalidateQueries(["instructions", recipe.id]);
        })
        .catch((error) => console.log(error.message));
    } else if (name === "add") {
      axios
        .post("http://localhost:4000/instructions/", instructionToAdd)
        .then((res) => {
          console.log(res.data);
          getRecipeInstructions(form[0]["recipe-id"]);
          setInstructionToAdd(instructionInitialState);
        })
        .catch((error) => console.log("error", error));
    }
  };

  useEffect(() => {
    setForm(instructions);
  }, [instructions]);

  return (
    <div className={editInstructions.class}>
      <form className="recipe-form edit-instructions" onSubmit={handleSubmit}>
        <div className="instructions">
          {form &&
            form.map((instruction, index) => (
              <div key={instruction.id}>
                <input
                  className="recipe-form__input edit-instruction__input"
                  type="text"
                  value={instruction.description}
                  onChange={(event) => handleChange(event, index)}
                  name="edit-description"
                />
                <DeleteItem
                  api={"http://localhost:4000/instructions/"}
                  id={instruction.id}
                  getItem={getRecipeInstructions}
                  itemId={instruction["recipe-id"]}
                />
              </div>
            ))}
        </div>
        <div className={add.class}>
          <input
            type="text"
            value={instructionToAdd[0].description}
            onChange={handleChange}
            name="add-instruction"
            className="recipe-form__input edit-instructions__input"
            placeholder="Add an instruction"
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
