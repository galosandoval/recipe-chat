const db = require("../../data/connection");

const findUsers = () => db("users");

const findUserById = (id) => db("users").where({ id });

const findUserByUsername = (username) => db("users").where({ username });

const addUser = (creds) =>
  db("users")
    .insert(creds)
    .then((newUserId) => {
      return findUserById(newUserId);
    });

module.exports = {
  findUsers,
  findUserById,
  addUser,
  findUserByUsername
};
