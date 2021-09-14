import axios from "axios";
import React from "react";

export const DeleteItem = ({ api, id, getItem, itemId }) => {
  const handleClick = () => {
    axios.delete(`${api}${id}`).then((deletedItem) => {
      console.log(deletedItem);
      getItem(itemId);
    });
  };
  return <button onClick={handleClick}>Delete</button>;
};
