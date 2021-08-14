exports.up = function (knex) {
  return knex.schema.createTable("ingredient-list", (table) => {
    table.increments();
    table.integer("user-id").references("id").inTable("user").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("ingredient-list");
};
