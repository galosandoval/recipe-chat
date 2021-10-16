import React from "react";

export const Carousel = ({ page, handleClick, list }) => {
  return (
    <>
      <div className="buttons-container">
        {page !== 1 ? (
          <button name="left-button" className="images-button left" onClick={handleClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              filter="drop-shadow(0 0 4px rgba(0, 0, 0, 1))"
            >
              <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
            </svg>
          </button>
        ) : (
          <span></span>
        )}
        {page !== list["img-url"].length ? (
          <button name="right-button" className="images-button right" onClick={handleClick}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              filter="drop-shadow(0 0  4px rgba(0, 0, 0, 1))"
            >
              <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
            </svg>
          </button>
        ) : (
          <span></span>
        )}
      </div>
      <div className="circle-container">
        {[...Array(list["img-url"].length)].map((_element, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            filter="drop-shadow(0 0 3px rgba(0, 0, 0, 1))"
            viewBox="0 0 24 24"
            className={`circle-svg circle${index}`}
          >
            <circle cx="12" cy="12" r="12" />
          </svg>
        ))}
      </div>
    </>
  );
};