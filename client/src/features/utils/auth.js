import { initReactQueryAuth } from "react-query-auth";
import { addUser, getUserById, loginUser } from "../services/authService";
import { storage } from "./storage";

export async function handleUserResponse(data) {
  const { token, user } = data;
  storage.setToken(token);
  storage.setUserId(user.id);
  return user;
}

async function loadUser() {
  let user = null;
  if (storage.getToken() && storage.getUserId()) {
    const id = storage.getUserId();
    const data = await getUserById(id);
    user = data.data;
  }
  return user;
}

async function loginFn(data) {
  const response = await loginUser(data);
  const user = await handleUserResponse(response);
  return user;
}

async function registerFn(data) {
  const response = await addUser(data);
  const user = await handleUserResponse(response);
  return user;
}

async function logoutFn() {
  storage.clearToken();
  storage.clearUserId();
}

const authConfig = {
  loadUser,
  loginFn,
  registerFn,
  logoutFn
};

const { AuthProvider, useAuth } = initReactQueryAuth(authConfig);

export { AuthProvider, useAuth };
