import React, { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";
import { listSVG } from "../../styles/svgs";
import { Loading } from "../status/Loading";
import { Carousel } from "./Carousel";
import { addBlur, removeBlur } from "../utils/modalBlur";

const Paper = lazy(() => import("./Paper"));

const initialListState = {
  isVisible: false,
  setTop: 110
};

export const GrocerylistCard = ({ list, index }) => {
  const [carousel, setCarousel] = useState(0);
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState(initialListState);
  const circles = document.querySelectorAll(`.carousel__svg-circle-${index}`);

  const card = useRef(null);

  const closeOtherLists = () => {
    const closeButtons = document.querySelectorAll(".paper__btn-close");

    closeButtons.forEach((button) => button.click());
  };

  const fillWhite = "carousel__svg-circle--fill-white";

  const handleClick = (event) => {
    const { name } = event.currentTarget;
    const windowWidth = window.screen.width;

    if (name === "right-button") {
      console.log({ windowWidth });
      console.log(list["img-url"]);
      if (windowWidth <= 575) {
        setCarousel((state) => (state -= 100));
      } else {
        setCarousel((state) => (state -= Math.ceil(100 / list["img-url"].length)));
      }
      setPage((state) => (state += 1));
      circles[page - 1].classList.remove(fillWhite);
    }
    if (name === "left-button") {
      if (windowWidth <= 575) {
        setCarousel((state) => (state += 100));
      } else {
        setCarousel((state) => (state += Math.ceil(100 / list["img-url"].length)));
      }
      circles[page - 1].classList.remove(fillWhite);
      setPage((state) => (state -= 1));
    }
    const paper = document.querySelector(`#paper-${list["grocery-list-id"]}`);
    if (name === "open-list") {
      disableBodyScroll(paper);
      addBlur();
      closeOtherLists();
      setListState({ isVisible: true, setTop: 0 });
    }
    if (name === "close-list") {
      enableBodyScroll(paper);
      removeBlur();
      setListState({ isVisible: false, setTop: 110 });
    }
  };

  useLayoutEffect(() => {
    if (circles[page - 1]) {
      circles[page - 1].classList.add(fillWhite);
    }
  }, [page, circles]);

  useEffect(() => {
    setListState((state) => ({ ...state, setTop: card.current.offsetHeight }));
  }, []);

  return (
    <div ref={card} className="card grocerylist-card">
      <div className="grocerylist-card__heading">
        <h2 className="u-card-heading">{list["grocery-list-name"]}</h2>
      </div>
      <div className="grocerylist-card__carousel">
        {list["img-url"].length > 1 && (
          <Carousel listIndex={index} page={page} handleClick={handleClick} list={list} />
        )}
        <div
          className="grocerylist-card__image-container"
          style={{ transform: `translateX(${carousel}%)` }}
        >
          {list["img-url"].map((img, index) => (
            <img
              className="grocerylist-card__image"
              src={img}
              alt={list.descriptions}
              key={`${list.id}-${index}`}
            />
          ))}
        </div>
      </div>
      <div className="grocerylist-card__info">
        <h2>Recipes</h2>
        <ul className="grocerylist-card__tag-container">
          {list["recipe-name"].map((name, index) => (
            <li className="grocerylist-card__tag" key={`${name}-${index}`}>
              {name}
            </li>
          ))}
        </ul>
      </div>
      <button
        className="btn-round grocerylist-card__page-btn"
        name="open-list"
        onClick={handleClick}
      >
        {listSVG}
      </button>
      <Suspense fallback={<Loading />}>
        <Paper
          grocerylistId={list["grocery-list-id"]}
          listState={listState}
          handleClick={handleClick}
        />
      </Suspense>
    </div>
  );
};
