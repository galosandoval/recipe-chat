import React from "react";

export const LoadingCards = () => {
  const cards = (
    <div className="loading-cards">
      <div className="loading-cards__card card">
        <span className="loading-cards__heading">
          <span className="loading-cards__heading-h1"></span>
        </span>
        <span className="loading-cards__img-container"></span>
        <span className="loading-cards__info">
          <span className="loading-cards__info-title"></span>
          <span className="loading-cards__info-tags">
            <span className="loading-cards__info-tag"></span>
            <span className="loading-cards__info-tag"></span>
            <span className="loading-cards__info-tag"></span>
          </span>
        </span>
        <span className="loading-cards__button">
          <span className="loading-cards__button-content"></span>
        </span>
      </div>
    </div>
  );
  return (
    <>
      {cards}
      {cards}
      {cards}
      {cards}
      {cards}
      {cards}
    </>
  );
};
