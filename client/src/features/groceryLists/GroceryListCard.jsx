import { useState } from "react";
import "../../styles/recipesStyles.css";
import "../../styles/grocerylistStyles.css";

export const GroceryListCard = ({ list }) => {
  const [carousel, setCarousel] = useState(true);
  console.log("list", list);
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

  const handleClick = (event) => {};

  return (
    <div className="card" key={list.id} onClick={handleClick}>
      <h2>{list["grocery-list-name"]}</h2>
      <div className="images-container">
        {carousel && (
          <>
            <button name="left-button" className="images-button left">
              {"<"}
            </button>
            <button name="right-button" className="images-button right">
              {">"}
            </button>
          </>
        )}
        {list["img-url"].map((img, index) => {
          if (img === null) {
            return null;
          }
          // if ()
          // setCarousel(false);
          return <img src={img} alt={list.descriptions} key={list.description[index]} />;
        })}
      </div>
      <p>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Illo fuga corporis modi pariatur
        deserunt porro incidunt nostrum velit possimus recusandae.
      </p>
    </div>
  );
};
