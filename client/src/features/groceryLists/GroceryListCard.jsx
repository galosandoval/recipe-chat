import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import "../../styles/recipesStyles.css";
import "../../styles/grocerylistStyles.css";
import { Carousel } from "./Carousel";
import { Paper } from "./Paper";

const initialListState = {
  isVisible: false,
  setTop: null
};

export const GroceryListCard = ({ list }) => {
  const [carousel, setCarousel] = useState(0);
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState(initialListState);

  const card = useRef(null);

  const handleClick = (event) => {
    const { name } = event.currentTarget;
    if (name === "right-button") {
      setCarousel((state) => (state -= 25));
      setPage((state) => (state += 1));
    }
    if (name === "left-button") {
      setCarousel((state) => (state += 25));
      setPage((state) => (state -= 1));
    }
    if (name === "list") {
      listState.isVisible
        ? setListState({ isVisible: false, setTop: card.current.offsetHeight })
        : setListState({ isVisible: true, setTop: 0 });
    }
  };

  useLayoutEffect(() => {
    const circles = document.querySelectorAll(".circle-svg");
    if (circles[page - 2]) {
      circles[page - 2].classList.remove("no-opacity");
    } else {
      circles[page].classList.remove("no-opacity");
    }
    circles[page - 1].classList.add("no-opacity");
  }, [page]);

  useEffect(() => {
    setListState((state) => ({ ...state, setTop: card.current.offsetHeight }));
  }, []);

  return (
    <div ref={card} className="card" key={list.id}>
      <h2>{list["grocery-list-name"]}</h2>
      <div className="images-container">
        {list["img-url"].length > 1 && (
          <Carousel page={page} handleClick={handleClick} list={list} />
        )}
        <div className="images" style={{ transform: `translateX(${carousel}em)` }}>
          {list["img-url"].map((img, index) => (
            <img src={img} alt={list.descriptions} key={list.description[index]} />
          ))}
        </div>
      </div>
      <div className="info">
        <h2>Recipes</h2>
        {list["recipe-name"].map((name, index) => (
          <li key={`${name}-${index}`}>{name}</li>
        ))}
        <button name="list" onClick={handleClick}>
          Ingredients {">"}
        </button>
      </div>
      <Paper
        grocerylistId={list["grocery-list-id"]}
        listState={listState}
        handleClick={handleClick}
      />
    </div>
  );
};
