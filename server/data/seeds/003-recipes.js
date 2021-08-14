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
          "grocery-list-id": 1
        },
        {
          id: 2,
          "recipe-name": "test1",
          "user-id": 2,
          "grocery-list-id": 2
        },
        {
          id: 3,
          "recipe-name": "test2",
          "user-id": 3,
          "grocery-list-id": 3
        },
        {
          id: 4,
          "recipe-name": "Spinach Lentil Dal",
          "user-id": 1,
          "grocery-list-id": 4
        },
        {
          id: 5,
          "recipe-name": "PB&J",
          "user-id": 1,
          "grocery-list-id": 4
        }
      ]);
    });
};
