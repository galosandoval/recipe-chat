import React from "react";
import { xSVG } from "../../../utils/svgs";

export const DeleteItem = ({ setToBeDeleted, instruction, setDeleteModal }) => {
  const openDeleteModal = () => {
    const modal = document.querySelector("body");

    setToBeDeleted(instruction);
    modal.classList.add("modal-blur");
    setDeleteModal({
      isOpen: true,
      className: "delete-confirmation"
    });
  };
  return (
    <button className="delete-btn" onClick={openDeleteModal}>
      {xSVG}
    </button>
  );
};
