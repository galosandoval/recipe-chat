exports.up = function (knex) {
  return knex.schema.createTable("ingredients", (table) => {
    table.increments();
    table.integer("recipe-id").notNullable().references("id").inTable("recipes");
    table.string("name", 128).notNullable();
    table.integer("price");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("ingredients");
};
