import axios from "axios";
import React from "react";
import { xSVG } from "../../../utils/svgs";

export const DeleteItem = ({ handleClick }) => {
  return (
    <button className="delete-btn" onClick={handleClick}>
      {xSVG}
    </button>
  );
};
