import axios from "axios";
import React from "react";

export const DeleteInstruction = ({ instruction }) => {
  console.log("instrcution", instruction.id);
  // TODO: Only delete by recipe ID available, make delete by instruction ID
  const handleClick = (event) => {
    event.preventDefault();
    axios
      .delete(`http://localhost:4000/instructions/${instruction.id}`)
      .then((res) => console.log(res))
      .catch((error) => console.log(error));
  };
  return <button onClick={handleClick}>Delete</button>;
};
