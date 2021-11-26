import React, { useEffect, useState } from "react";
import { slashSVG, xSVG } from "../../styles/svgs";

export const ErrorToast = ({ errorMessage }) => {
  const [toastClass, setToastClass] = useState("error-toast error-toast");
  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setToastClass("error-toast error-toast--show");
      }, 500);
      setTimeout(() => {
        setToastClass("error-toast error-toast");
      }, 5000);
    }
  }, [errorMessage]);
  return (
    // classname=error-toast > error-toast--show
    <div className={toastClass}>
      <div className="error-toast__slash">{slashSVG}</div>
      <div className="error-toast__message">
        <h3>Error:</h3>
        <p>{errorMessage}</p>
      </div>
      <button className="error-toast__cross">{xSVG}</button>
    </div>
  );
};
