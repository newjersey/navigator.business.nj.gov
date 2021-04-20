import axios from "axios";
import { MunicipalityDetail, UserData } from "../types/types";

const apiBaseUrl = process.env.API_BASE_URL || "";
export const getUserData = (id: string): Promise<UserData> => {
  return axios.get(`${apiBaseUrl}/api/users/${id}`).then((response) => response.data);
};

export const getMunicipalities = (): Promise<MunicipalityDetail[]> => {
  return get("/municipalities");
};

export const getMunicipality = (id: string): Promise<MunicipalityDetail> => {
  return get(`/municipalities/${id}`);
};

export const postUserData = (userData: UserData): Promise<UserData> => {
  return axios.post(`${apiBaseUrl}/api/users`, userData).then((response) => response.data);
};

export const get = <T>(url: string): Promise<T> => {
  return axios.get(`${apiBaseUrl}/api${url}`).then((response) => response.data);
};
