import React, { useLayoutEffect, useState } from "react";
import "../../styles/recipesStyles.css";
import "../../styles/grocerylistStyles.css";

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
          <>
            <div className="buttons-container">
              {page !== 1 ? (
                <button name="left-button" className="images-button left" onClick={handleClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                    <path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z" />
                  </svg>
                </button>
              ) : (
                <span></span>
              )}
              {page !== list["img-url"].length ? (
                <button name="right-button" className="images-button right" onClick={handleClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
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
                  viewBox="0 0 24 24"
                  className={`circle-svg circle${index}`}
                >
                  <circle cx="12" cy="12" r="12" />
                </svg>
              ))}
            </div>
          </>
        )}
        <div className="images" style={{ transform: `translateX(${carousel}em)` }}>
          {list["img-url"].map((img, index) => {
            return <img src={img} alt={list.descriptions} key={list.description[index]} />;
          })}
        </div>
      </div>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo fuga corporis modi pariatur
        deserunt porro incidunt nostrum velit possimus recusandae.
      </p>
    </div>
  );
};
