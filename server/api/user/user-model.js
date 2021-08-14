const db = require("../../data/connection");

const findAllUsers = () => {
  return db("user").select("id", "firstName", "lastName", "email");
};

const findUserById = (id) => {
  return db("user")
    .select("id", "firstName", "lastName", "email")
    .where("id", id);
};

const findUserIngredientLists = (id) => {
  return db('user').join('ingredient-list', 'user.id', '=', 'ingredient-list.user-id').select('user.firstName', 'user.lastName', 'user.email', '')
}

module.exports = {
  findAllUsers,
  findUserById
};
