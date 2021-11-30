exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex("recipes")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("recipes").insert([
        {
          id: 1,
          "recipe-name": "CREAMY MUSHROOM TOAST WITH SOFT EGG & GRUYÈRE",
          description:
            "A twist on the beloved British favorite, delightfully simple and absolutely delicious for breakfast, brunch, lunch, or even dinner.",
          "img-url":
            "https://www.gordonramsay.com/assets/Uploads/_resampled/CroppedFocusedImage192072050-50-Mushroomtoast.jpg",
          author: "gordon ramsay",
          address: "https://www.gordonramsay.com/gr/recipes/mushroomtoast/",
          "user-id": 1
        },
        {
          id: 2,
          "recipe-name": "the only ice cream recipe you'll ever neeed",
          description:
            "This silky, luscious and very classic custard can be used as the base for any ice cream flavor you can dream up. These particular proportions of milk and cream to egg yolk will give you a thick but not sticky ice cream that feels decadent but not heavy. For something a little lighter, use more milk and less cream, as long as the dairy adds up to 3 cups. You can also cut down on egg yolks for a thinner base, but don’t go below three.",
          "img-url":
            "https://static01.nyt.com/images/2014/06/27/multimedia/clark-icecream/clark-icecream-articleLarge.jpg",
          author: "melissa clark",
          address:
            "https://cooking.nytimes.com/recipes/1016605-the-only-ice-cream-recipe-youll-ever-need",
          "user-id": 1
        },
        {
          id: 3,
          "recipe-name": "Spinach Lentil Dal",
          description:
            "This Lentil Dal with Spinach Sauce is one of the most delicious, soul-satisfying plant-based, Indian meals! This version is fragrant, flavorful and packed with nutrients- think of this like Saag Paneer, but substituting black lentils instead of the cheese! Super tasty and healthy",
          "user-id": 1,
          author: "sylvia fountaine",
          address: "https://www.feastingathome.com/lentil-dal-with-spinach/",
          "img-url": "https://www.feastingathome.com/wp-content/uploads/2020/06/Lentil-Dal-15.jpg"
        },
        {
          id: 4,
          "recipe-name": "PB&J",
          description: "Simple, yet classic treat.",
          "user-id": 1,
          "img-url": "https://data.thefeedfeed.com/static/other/15360644095b8e7b992bf55.jpg",
          author: "Galo sandoval"
        }
      ]);
    });
};
