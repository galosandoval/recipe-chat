const User = require("../users/users-model");

const validateRecipe = (req, res, next) => {
  const body = req.body;

  if (!body["user-id"]) res.status(400).json({ error: "recipe must have a user-id" });
  else {
    User.findUserById(body["user-id"]).then((user) => {
      if (user.length !== 0) next();
      else {
        res.status(404).json({ error: `user with id: ${id} does not exist` });
      }
    });
  }
};
