const db = require("../../data/connection");

const findAllUsers = () =>
  db("users").select("id", "firstName", "lastName", "email");

const findUserById = (id) =>
  db("users").select("id", "firstName", "lastName", "email").where("id", id);

module.exports = {
  findAllUsers,
  findUserById
};
