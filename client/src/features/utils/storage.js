export const storage = {
  getToken: () => JSON.parse(window.localStorage.getItem("token")),
  setToken: (token) => window.localStorage.setItem("token", JSON.stringify(token)),
  clearToken: () => window.localStorage.removeItem("token"),
  getUserId: () => JSON.parse(window.localStorage.getItem("user-id")),
  setUserId: (userId) => window.localStorage.setItem("user-id", JSON.stringify(userId)),
  clearUserId: () => window.localStorage.removeItem("user-id")
};
