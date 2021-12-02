import React from "react";
import { deleteSVG } from "../../../styles/svgs";

export const DeleteItem = ({ setToBeDeleted, item, setDeleteModal }) => {
  const openDeleteModal = () => {
    const modal = document.querySelector("body");

    setToBeDeleted(item);
    modal.classList.add("modal-blur");
    setDeleteModal({
      isOpen: true,
      className: "delete-confirmation"
    });
  };
  return (
    <button className="delete-btn" onClick={openDeleteModal}>
      {deleteSVG}
    </button>
  );
};
