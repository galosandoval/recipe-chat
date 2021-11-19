import React from "react";

export const AddGrocerylistCheckboxes = ({ r, index, checked, setChecked }) => {
  const handleChange = (position) => {
    const updatedCheckedState = checked.map((c, i) => (i === position ? !c : c));

    setChecked(updatedCheckedState);
  };
  return (
    <div className="add-form__switch-container">
      <p>{r["recipe-name"]}</p>
      <label className="add-form__switch">
        <input
          type="checkbox"
          className="add-form__checkbox"
          checked={checked[index]}
          onChange={() => handleChange(index)}
        />
        <span className="add-form__slider"></span>
      </label>
    </div>
  );
};
