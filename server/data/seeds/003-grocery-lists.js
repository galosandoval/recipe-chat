exports.seed = function (knex, Promise) {
  // Deletes ALL existing entries
  return knex("grocery-lists")
    .del()
    .then(function () {
      // Inserts seed entries
      return knex("grocery-lists").insert([
        { id: 1, name: "sweet treats", "user-id": 1, completed: false },
        { id: 2, name: "savory supper", "user-id": 1, completed: false },
        { id: 3, name: "friday's meals", "user-id": 1, completed: false }
      ]);
    });
};
