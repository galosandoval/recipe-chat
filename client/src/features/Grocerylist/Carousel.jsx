import React from "react";
import { leftArrowSVG, rightArrowSVG } from "../../styles/svgs";

export const Carousel = ({ page, handleClick, list, listIndex }) => {
  return (
    <div className="carousel">
      <div className="carousel__buttons">
        {page !== 1 ? (
          <button name="left-button" className="carousel__button" onClick={handleClick}>
            {leftArrowSVG}
          </button>
        ) : (
          <span></span>
        )}
        {page !== list["img-url"].length ? (
          <button name="right-button" className="carousel__button" onClick={handleClick}>
            {rightArrowSVG}
          </button>
        ) : (
          <span></span>
        )}
      </div>
      <div className="circle-container carousel__circles">
        {[...Array(list["img-url"].length)].map((_element, index) => (
          <svg
            key={index}
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            filter="drop-shadow(0 1.5rem 3rem rgba(0, 0, 0, 1))"
            viewBox="0 0 24 24"
            className={`carousel__svg-circle carousel__svg-circle-${listIndex}`}
          >
            <circle cx="12" cy="12" r="12" />
          </svg>
        ))}
      </div>
    </div>
  );
};
