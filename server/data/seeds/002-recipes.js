exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("recipes")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("recipes").insert([
        {
          id: 1,
          "recipe-name": "test",
          "user-id": 1,
          description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, nisi! Distinctio repellat modi dolore tenetur consectetur? Soluta, quas eaque. Quam iste sapiente voluptatem, nam tenetur alias! Magni pariatur maxime adipisci."
        },
        {
          id: 2,
          "recipe-name": "test1",
          "user-id": 2
        },
        {
          id: 3,
          "recipe-name": "test2",
          "user-id": 3
        },
        {
          id: 4,
          "recipe-name": "Spinach Lentil Dal",
          description:
            "This Lentil Dal with Spinach Sauce is one of the most delicious, soul-satisfying plant-based, Indian meals! This version is fragrant, flavorful and packed with nutrients- think of this like Saag Paneer, but substituting black lentils instead of the cheese! Super tasty and healthy",
          "user-id": 1,

          "img-url": "https://www.feastingathome.com/wp-content/uploads/2020/06/Lentil-Dal-15.jpg"
        },
        {
          id: 5,
          "recipe-name": "PB&J",
          description: "Simple, yet classic treat.",
          "user-id": 1,
          "img-url": "https://data.thefeedfeed.com/static/other/15360644095b8e7b992bf55.jpg"
        }
      ]);
    });
};
