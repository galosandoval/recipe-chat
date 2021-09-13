import axios from "axios";
import React, { useEffect, useState } from "react";
import { DeleteInstruction } from "../delete/DeleteInstruction";

const addInitialState = {
  open: false,
  class: "add-instruction input"
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
      : setAdd({ open: true, class: "add-instruction input show-input" });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { name } = document.activeElement;

    if (name === "edit") {
      axios
        .put(`http://localhost:4000/instructions/${form[0]["recipe-id"]}`, form)
        .then((res) => {
          console.log("edit", res.data);
          getRecipeInstructions(form[0]["recipe-id"]);
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
      <form className="edit-instructions-form" onSubmit={handleSubmit}>
        <div className="instructions">
          {form &&
            form.map((instruction, index) => (
              <>
                <input
                  className="input"
                  type="text"
                  key={instruction.id}
                  value={instruction.description}
                  onChange={(event) => handleChange(event, index)}
                  name="edit-description"
                />
                <DeleteInstruction instruction={instruction} />
              </>
            ))}
        </div>
        <div className={add.class}>
          <input
            type="text"
            value={instructionToAdd[0].description}
            onChange={handleChange}
            name="add-instruction"
            className="input"
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
