const validateBody = (req, res, next) => {
  const { username, password: plainPassword } = req.body;

  if (!username || typeof username !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }
  if (!plainPassword || typeof plainPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }
  if (plainPassword.length < 6) {
    return res.json({
      status: "error",
      error: "Invalid password: must be at least 6 characters"
    });
  }

  next();
};

module.exports = {
  validateBody
};
