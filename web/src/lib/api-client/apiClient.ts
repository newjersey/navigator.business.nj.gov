import { getCurrentToken } from "@/lib/auth/sessionHelper";
import { NameAvailability, SelfRegResponse } from "@/lib/types/types";
import { NameAndAddress, UserData } from "@businessnjgovnavigator/shared";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const apiBaseUrl = process.env.API_BASE_URL || "";
export const getUserData = (id: string): Promise<UserData> => {
  return get(`/users/${id}`);
};

export const postUserData = async (userData: UserData): Promise<UserData> => {
  return post(`/users`, userData);
};

export const searchBusinessName = (name: string): Promise<NameAvailability> => {
  return get(`/business-name-availability?query=${encodeURIComponent(name)}`);
};

export const checkLicenseStatus = (nameAndAddress: NameAndAddress): Promise<UserData> => {
  return post(`/license-status`, nameAndAddress);
};

export const postBusinessFormation = (userData: UserData, returnUrl: string): Promise<UserData> => {
  return post(`/formation`, { userData, returnUrl });
};

export const getCompletedFiling = (): Promise<UserData> => {
  return get(`/completed-filing`);
};

export const postNewsletter = async (userData: UserData): Promise<UserData> => {
  return post(`/ext/newsletter`, userData, false);
};
export const postUserTesting = async (userData: UserData): Promise<UserData> => {
  return post(`/ext/userTesting`, userData, false);
};

export const postSelfReg = (userData: UserData): Promise<SelfRegResponse> => {
  return axios
    .post(`${apiBaseUrl}/api/self-reg`, userData)
    .then((response) => response.data)
    .catch((error: AxiosError) => {
      return Promise.reject(error.response?.status);
    });
};

export const get = async <T>(url: string): Promise<T> => {
  const authHeader = await authConfig();
  return axios
    .get(`${apiBaseUrl}/api${url}`, authHeader)
    .then((response) => response.data)
    .catch((error: AxiosError) => {
      return Promise.reject(error.response?.status || 500);
    });
};

export const post = async <T, R>(url: string, data: R, auth = true): Promise<T> => {
  const authHeader = auth ? await authConfig() : {};
  return axios
    .post(`${apiBaseUrl}/api${url}`, data, authHeader)
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
