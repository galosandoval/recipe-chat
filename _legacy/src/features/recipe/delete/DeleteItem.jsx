import React from "react";
import { deleteSVG } from "../../../styles/svgs";
import { addBlur } from "../../utils/modalBlur";

export const DeleteItem = ({ setToBeDeleted, item, setDeleteModal }) => {
  const openDeleteModal = () => {
    addBlur();

    setToBeDeleted(item);
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
