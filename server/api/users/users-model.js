const db = require("../../data/connection");

const findUsers = () => db("users");

const findUserById = (id) => db("users").where({ id });

const addUser = (creds) =>
  db("users")
    .insert(creds)
    .then((newUserId) => {
      return findUserById(newUserId);
    });

module.exports = {
  findUsers,
  findUserById,
  addUser
};
