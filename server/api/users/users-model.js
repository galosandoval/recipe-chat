const db = require("../../data/connection");

const findUsers = () =>
  db("users").select("id", "firstName", "lastName", "email");

const findUserById = (id) =>
  db("users").select("id", "firstName", "lastName", "email").where("id", id);

module.exports = {
  findUsers,
  findUserById
};
