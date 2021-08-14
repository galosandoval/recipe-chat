exports.up = function (knex) {
  return knex.schema.createTable("grocery-lists", (table) => {
    table.increments();
    table.integer("user-id").references("id").inTable("users").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("grocery-lists");
};
