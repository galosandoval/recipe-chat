const db = require("../../data/connection");

const findAllUsers = () =>
  db("user").select("id", "firstName", "lastName", "email");

const findUserById = (id) =>
  db("user").select("id", "firstName", "lastName", "email").where("id", id);

module.exports = {
  findAllUsers,
  findUserById
};
