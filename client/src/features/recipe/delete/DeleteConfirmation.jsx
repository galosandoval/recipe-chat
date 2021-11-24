import React from "react";

export const DeleteConfirmation = ({ name, deleteModal, openDeleteModal }) => {
  return (
    // classname "delete-confirmation"
    <div className={deleteModal.className}>
      <h1>Are you sure you want to delete this {name}</h1>
      <div className="delete-confirmation__btns">
        <button
          onClick={openDeleteModal}
          className="delete-confirmation__btn delete-confirmation__btn--cancel"
        >
          Cancel
        </button>
        <button className="delete-confirmation__btn delete-confirmation__btn--confirm">
          Delete
        </button>
      </div>
    </div>
  );
};
