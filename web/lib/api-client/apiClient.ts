import axios from "axios";
import { UserData } from "../types/UserData";

const apiBaseUrl = process.env.API_BASE_URL || "";
export const getUserData = (id: string): Promise<UserData> => {
  return axios.get(`${apiBaseUrl}/users/${id}`).then((response) => response.data);
};

export const postUserData = (userData: UserData): Promise<UserData> => {
  return axios.post(`${apiBaseUrl}/users`, userData).then((response) => response.data);
};

export const get = (url: string): Promise<unknown> => {
  return axios.get(`${apiBaseUrl}${url}`).then((response) => response.data);
};
