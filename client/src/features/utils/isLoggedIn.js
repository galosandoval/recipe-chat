const { storage } = require("./storage");

module.exports = () => {
  return !!storage.getToken && !!storage.getUserId;
};
