exports.up = function (knex) {
  return knex.schema.createTable("recipes-grocery-lists", (table) => {
    table.increments();
    table.integer("recipe-id").notNullable().references("id").inTable("recipes");
    table.integer("grocery-list-id").notNullable().references("id").inTable("grocery-lists");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("recipes-grocery-lists");
};
