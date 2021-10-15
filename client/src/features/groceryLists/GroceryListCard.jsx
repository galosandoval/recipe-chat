import React, { useLayoutEffect, useState } from "react";
import "../../styles/recipesStyles.css";
import "../../styles/grocerylistStyles.css";
import { Carousel } from "./Carousel";
import { Todo } from "./Todo";

export const GroceryListCard = ({ list }) => {
  const [carousel, setCarousel] = useState(0);
  const [page, setPage] = useState(1);

  //  const list = {
  //    completed: 0
  //    created_at: "2021-10-13 21:52:38"
  //    description: (3) ['This Lentil Dal with Spinach Sauce is one of the m…ls instead of the cheese! Super tasty and healthy', 'Simple, yet classic treat.', 'Lorem ipsum dolor sit amet consectetur adipisicing…am tenetur alias! Magni pariatur maxime adipisci.']
  //    grocery-list-id: 1
  //    grocery-list-name: "test1"
  //    img-url: (3) ['https://www.feastingathome.com/wp-content/uploads/2020/06/Lentil-Dal-15.jpg', 'https://data.thefeedfeed.com/static/other/15360644095b8e7b992bf55.jpg', null]
  //    recipe-id: (3) [4, 5, 1]
  //    recipe-name: (3) ['Spinach Lentil Dal', 'PB&J', 'test']
  //    recipes-grocery-lists-id: 1
  //    updated_at: "2021-10-13 21:52:38"
  //    user-id: 1
  //   }

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

  return (
    <div className="card" key={list.id} onClick={handleClick}>
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
        <button>Ingredients {">"}</button>
      </div>
      <Todo />
    </div>
  );
};
