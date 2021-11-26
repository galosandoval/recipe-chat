import React from "react";
import { checkSVG } from "../../styles/svgs";

export const AddButton = ({ className, children, name, type, mutation, defaultValue }) => {
  return (
    <button
      className={className ? `add-btn-submit ${className}` : "add-btn-submit"}
      name={name}
      type={type}
    >
      {children ? (
        children
      ) : mutation.status === "loading" ? (
        "Loading..."
      ) : mutation.status === "success" ? (
        <>
          Success<span>{checkSVG}</span>
        </>
      ) : (
        defaultValue
      )}
    </button>
  );
};
