import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Industry, LicenseStatusResult, NameAndAddress, NameAvailability, UserData } from "@/lib/types/types";
import { getCurrentToken } from "@/lib/auth/sessionHelper";
import { convertIndustryToLicenseType } from "@/lib/utils/convertIndustryToLicenseType";

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

export const checkLicenseStatus = (
  nameAndAddress: NameAndAddress,
  industry: Industry
): Promise<LicenseStatusResult> => {
  return post(`/license-status`, {
    ...nameAndAddress,
    licenseType: convertIndustryToLicenseType(industry),
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
