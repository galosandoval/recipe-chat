import axios from "axios";
import { useMutation } from "react-query";

const addUser = async (creds) => {
  const result = await axios.post("http://localhost:4000/auth/register", creds);
  console.log({ result });
  return result;
};

export const useAddUser = () => {
  return useMutation(addUser);
};

const loginUser = async (creds) => {
  return axios.post("http://localhost:4000/auth/login", creds);
};

export const useLogin = () => {
  return useMutation(loginUser);
};
