import React from "react";

export const AddGrocerylistCheckboxes = ({ r, index, checked, setChecked }) => {
  const handleChange = (position) => {
    const updatedCheckedState = checked.map((c, i) => (i === position ? !c : c));
    setChecked(updatedCheckedState);
  };
  return (
    <div className="grocerylist-form">
      <p>{r["recipe-name"]}</p>
      <label className="grocerylist-form__switch">
        <input
          type="checkbox"
          className="grocerylist-form__checkbox"
          checked={checked[index]}
          onChange={() => handleChange(index)}
        />
        <span className="grocerylist-form__slider"></span>
      </label>
    </div>
  );
};
