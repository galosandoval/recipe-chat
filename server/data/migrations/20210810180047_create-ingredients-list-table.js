exports.up = function (knex) {
  return knex.schema.createTable("ingredient", (table) => {
    table.increments();
    table.string("name", 128).notNullable();
    table.float("price", 2).notNullable();
    table.string("measurement").notNullable();
    table.float("amount").notNullable();
    table
      .integer("ingredient-list-id")
      .notNullable()
      .references("id")
      .inTable("ingredient-list");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("ingredient");
};
