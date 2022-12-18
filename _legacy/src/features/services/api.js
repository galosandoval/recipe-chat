import axios from "axios";

export const api = () => {
  return axios.create({
    baseURL: "https://listy-backend.herokuapp.com",
    headers: {
      Authorization: ` ${JSON.parse(localStorage.getItem("token"))}`
    }
  });
};
