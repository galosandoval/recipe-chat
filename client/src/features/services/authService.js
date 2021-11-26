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
