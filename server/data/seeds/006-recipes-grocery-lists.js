exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("recipes-grocery-lists")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("recipes-grocery-lists").insert([
        {
          id: 1,
          "recipe-id": 4,
          "grocery-list-id": 1,
          "user-id": 1
        },
        {
          id: 2,
          "recipe-id": 5,
          "grocery-list-id": 1,
          "user-id": 1
        },
        {
          id: 3,
          "recipe-id": 1,
          "grocery-list-id": 1,
          "user-id": 1
        }
      ]);
    });
};
