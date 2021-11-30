import { useMutation } from "react-query";
import { api } from "./api";

export const addUser = async (creds) => {
  const result = await api().post("/auth/register", creds);
  console.log({ result });
  return result;
};

export const useAddUser = () => {
  return useMutation(addUser);
};

export const loginUser = async (creds) => {
  const user = await api().post("/auth/login", creds);
  localStorage.setItem("token", JSON.stringify(user.data.token));
  return user.data;
};

export const useLogin = () => {
  return useMutation(loginUser);
};

export const getUserById = async (id) => {
  const result = await api().get(`/users/${id}`);
  return result;
};
