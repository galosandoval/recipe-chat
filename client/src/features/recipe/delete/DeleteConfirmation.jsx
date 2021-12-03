import React from "react";
import { checkSVG } from "../../../styles/svgs";

export const DeleteConfirmation = ({
  name,
  deleteModal,
  setDeleteModal,
  toBeDeleted,
  initialDeleteModalState,
  mutation
}) => {
  const closeDeleteModal = () => {
    const modal = document.querySelector("body");

    modal.classList.remove("modal-blur");
    setDeleteModal(initialDeleteModalState);
  };

  const handleDelete = async () => {
    await mutation.mutateAsync(toBeDeleted.id);
    setTimeout(() => {
      closeDeleteModal();
      mutation.reset();
    }, 1000);
  };
  return (
    // classname "delete-confirmation"
    <div className={deleteModal.className}>
      <h1>Are you sure you want to delete this {name}</h1>

      <div className="delete-confirmation__btns">
        <button
          onClick={closeDeleteModal}
          className="delete-confirmation__btn delete-confirmation__btn--cancel"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          className="delete-confirmation__btn delete-confirmation__btn--confirm"
        >
          {mutation.status === "loading" ? (
            "Loading..."
          ) : mutation.status === "success" ? (
            <>
              Success<span>{checkSVG}</span>
            </>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </div>
  );
};
