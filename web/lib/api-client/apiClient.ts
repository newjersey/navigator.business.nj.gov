import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { NameAvailability, UserData } from "@/lib/types/types";
import { getCurrentToken } from "@/lib/auth/sessionHelper";

const apiBaseUrl = process.env.API_BASE_URL || "";
export const getUserData = (id: string): Promise<UserData> => {
  return get(`/users/${id}`);
};

export const searchBusinessName = (name: string): Promise<NameAvailability> => {
  return get(`/business-name-availability?query=${encodeURIComponent(name)}`);
};

export const postUserData = async (userData: UserData): Promise<UserData> => {
  const authHeader = await authConfig();
  return axios.post(`${apiBaseUrl}/api/users`, userData, authHeader).then((response) => response.data);
};

export const get = async <T>(url: string): Promise<T> => {
  const authHeader = await authConfig();
  return axios
    .get(`${apiBaseUrl}/api${url}`, authHeader)
    .then((response) => response.data)
    .catch((error: AxiosError) => {
      return Promise.reject(error.response?.status);
    });
};

const authConfig = async (): Promise<AxiosRequestConfig> => {
  const token = await getCurrentToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};
