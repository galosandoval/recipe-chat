const db = require("../../data/connection");

const findUsers = () => db("users");

const findUserById = (id) => db("users").where("id", id);

module.exports = {
  findUsers,
  findUserById
};
