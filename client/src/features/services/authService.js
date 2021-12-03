import { useMutation } from "react-query";
import { api } from "./api";

export const addUser = async (creds) => {
  const result = await api().post("/auth/register", creds);
  return result;
};

export const useAddUser = () => {
  return useMutation(addUser);
};
export const loginUser = async (creds) => {
  const user = await api().post("/auth/login", creds);
  return user.data;
};

export const useLogin = () => {
  return useMutation(loginUser);
};

export const getUserById = async (id) => {
  const result = await api().get(`/users/${id}`);
  return result;
};
