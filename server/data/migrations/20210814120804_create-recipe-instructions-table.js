exports.up = function (knex) {
  return knex.schema.createTable("recipe-instructions", (table) => {
    table.increments();
    table.integer("recipe-id").notNullable().references("id").inTable("recipes");
    table.string("description").notNullable();
    table.integer("step").notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("recipe-instructions");
};
