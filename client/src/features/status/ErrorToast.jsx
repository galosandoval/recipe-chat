import React, { useEffect, useState } from "react";
import { slashSVG, xSVG } from "../../styles/svgs";

export const ErrorToast = ({ errorMessage, location }) => {
  const [message, setMessage] = useState(errorMessage);
  const [toastClass, setToastClass] = useState("error-toast");

  if (message.includes("401") && location === "login") {
    setMessage("Invalid Username/Password");
  }
  if (message.includes("401") && location === "register") {
    setMessage("Username already exists");
  }
  useEffect(() => {
    if (errorMessage) {
      setTimeout(() => {
        setToastClass("error-toast error-toast--show");
      }, 500);
      setTimeout(() => {
        setToastClass("error-toast");
      }, 5000);
    }
  }, [errorMessage]);
  return (
    // classname=error-toast > error-toast--show
    <div className={toastClass}>
      <div className="error-toast__slash">{slashSVG}</div>
      <div className="error-toast__message">
        <h3>Error:</h3>
        <p>{message}</p>
      </div>
      <button className="error-toast__cross">{xSVG}</button>
    </div>
  );
};
