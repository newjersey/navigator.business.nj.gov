import axios, { AxiosError, AxiosRequestConfig } from "axios";
import {
  NameAndAddress,
  NameAvailability,
  SelfRegRequest,
  SelfRegResponse,
  UserData,
} from "@/lib/types/types";
import { getCurrentToken } from "@/lib/auth/sessionHelper";

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

export const postSelfReg = (selfRegRequest: SelfRegRequest): Promise<SelfRegResponse> => {
  return axios
    .post(`${apiBaseUrl}/api/self-reg`, selfRegRequest)
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
      return Promise.reject(error.response?.status);
    });
};

export const post = async <T, R>(url: string, data: R): Promise<T> => {
  const authHeader = await authConfig();
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
