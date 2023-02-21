import React, { useEffect, useState } from "react";
import { slashSVG } from "../../styles/svgs";

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
      setToastClass("error-toast error-toast--show");
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
    </div>
  );
};
