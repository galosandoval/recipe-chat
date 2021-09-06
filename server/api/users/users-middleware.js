const User = require("./users-model");

const validateUser = (req, res, next) => {
  const id = req.body["user-id"];

  if (!id) res.status(400).json({ error: "request must have a user id" });
  else {
    User.findUserById(id).then((user) => {
      if (user.length !== 0) next();
      else {
        res.status(404).json({ error: `user with id: ${id} does not exist` });
      }
    });
  }
};

module.exports = {
  validateUser
};
