import axios from "axios";
import React, { useEffect, useState } from "react";

export const EditInstructions = ({ editInstructions, instructions }) => {
  const [form, setForm] = useState([]);

  const handleChange = (event, index) => {
    let tempForm = [...form];
    let tempInstruction = { ...tempForm[index] };
    tempInstruction.description = event.target.value;
    tempForm[index] = tempInstruction;
    setForm(tempForm);
  };

  const handleSubmit = () => {
    axios
      .put(`http://localhost:4000/instructions/${form[0]["recipe-id"]}`, form)
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => console.log(error.message));
  };

  useEffect(() => {
    setForm(instructions);
  }, [instructions]);

  return (
    <div className={editInstructions.class}>
      <form className="edit-instructions-form" onSubmit={handleSubmit}>
        {form &&
          form.map((instruction, index) => (
            <input
              className="input"
              type="text"
              key={instruction.id}
              value={instruction.description}
              onChange={(event) => handleChange(event, index)}
              name="description"
            />
          ))}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
