export const storage = {
  getToken: () => JSON.parse(window.localStorage.getItem("token")),
  getUserId: () => JSON.parse(window.localStorage.getItem("user-id")),
  getTime: () => JSON.parse(window.localStorage.getItem("setup-time")),
  setToken: (token) => window.localStorage.setItem("token", JSON.stringify(token)),
  setUserId: (userId) => window.localStorage.setItem("user-id", JSON.stringify(userId)),
  setTime: (currentTime) => window.localStorage.setItem("setup-time", JSON.stringify(currentTime)),
  clearUserId: () => window.localStorage.removeItem("user-id"),
  clearToken: () => window.localStorage.removeItem("token"),
  clearTime: () => window.localStorage.removeItem("setup-time")
};
