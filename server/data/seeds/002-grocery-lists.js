exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex("grocery-lists")
    .truncate()
    .then(function () {
      // Inserts seed entries
      return knex("grocery-lists").insert([
        { id: 1, "user-id": 1 },
        { id: 2, "user-id": 2 },
        { id: 3, "user-id": 3 },
        { id: 4, "user-id": 1 }
      ]);
    });
};
