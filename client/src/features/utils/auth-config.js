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
  const hours = 8;
  const now = new Date().getTime();
  const setupTime = storage.getTime();

  if (setupTime == null) {
    storage.setTime(now);
  } else {
    if (now - setupTime > hours * 60 * 60 * 1000) {
      storage.clearTime();
      storage.clearToken();
      storage.clearUserId();
    }
  }

  let user = null;
  if (storage.getToken() && storage.getUserId() && storage.getTime()) {
    const id = storage.getUserId();
    const data = await getUserById(id);
    user = data.data;
  }

  return user;
}

async function loginFn(data) {
  try {
    const response = await loginUser(data);
    const user = await handleUserResponse(response);
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function registerFn(data) {
  const response = await addUser(data);
  console.log({ response });
  const user = await handleUserResponse(response.data);
  console.log({ user });
  return user;
}

async function logoutFn() {
  storage.clearToken();
  storage.clearUserId();
  storage.clearTime();
}

const authConfig = {
  loadUser,
  loginFn,
  registerFn,
  logoutFn
};

const { AuthProvider, useAuth } = initReactQueryAuth(authConfig);

export { AuthProvider, useAuth };
