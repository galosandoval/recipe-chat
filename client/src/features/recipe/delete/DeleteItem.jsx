import axios from "axios";
import React from "react";

export const DeleteItem = ({ api, id }) => {
  const handleClick = () => {
    axios.delete(`${api}${id}`).then((deletedItem) => {
      console.log(deletedItem);
    });
  };
  return <button onClick={handleClick}>Delete</button>;
};
