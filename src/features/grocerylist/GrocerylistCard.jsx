import React, { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import { enableBodyScroll } from "body-scroll-lock";
import { listSVG } from "../../styles/svgs";
import { Carousel } from "./Carousel";
import { removeBlur } from "../utils/modalBlur";

const Paper = lazy(() => import("./paper/Paper"));

export const GrocerylistCard = ({ list, index }) => {
  const [carousel, setCarousel] = useState(0);
  const [page, setPage] = useState(1);
  const [listIsVisible, setListIsVisible] = useState(false);
  const [mountPaper, setMountPaper] = useState(false)
  const circles = document.querySelectorAll(`.carousel__svg-circle-${index}`);

  const card = useRef(null);
  const paper = useRef(null);
  const closeBtn = useRef(null);

  const fillWhite = "carousel__svg-circle--fill-white";

  const handleClick = (event) => {
    const { name } = event.currentTarget;
    const windowWidth = window.screen.width;

    if (name === "right-button") {
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
  };

  const handleShowPaper = () => {
    const windowWidth = window.screen.width;
    setMountPaper(true)

    if (windowWidth <= 575) {
      enableBodyScroll(paper);
      removeBlur();
    }
    setListIsVisible((state) => !state);
  };

  useLayoutEffect(() => {
    if (circles[page - 1]) {
      circles[page - 1].classList.add(fillWhite);
    }
  }, [page, circles]);

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
        onClick={handleShowPaper}
      >
        {listSVG}
      </button>
      <Suspense fallback={null}>
        <Paper
          paper={paper}
          listIsVisible={listIsVisible}
          closeBtn={closeBtn}
          grocerylistId={list["grocery-list-id"]}
          setListIsVisible={setListIsVisible}
          mountPaper={mountPaper}
        />
      </Suspense>
    </div>
  );
};
