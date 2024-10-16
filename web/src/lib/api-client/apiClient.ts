import { getCurrentToken } from "@/lib/auth/sessionHelper";
import { SelfRegResponse } from "@/lib/types/types";
import { phaseChangeAnalytics, setPhaseDimension } from "@/lib/utils/analytics-helpers";
import { getCurrentBusiness, LicenseTaskID } from "@businessnjgovnavigator/shared";
import {
  InputFile,
  LicenseSearchNameAndAddress,
  NameAvailability,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { ElevatorSafetyRegistrationSummary } from "@businessnjgovnavigator/shared/elevatorSafety";
import {
  HousingRegistrationRequestLookupResponse,
  PropertyInterestType,
} from "@businessnjgovnavigator/shared/housing";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const apiBaseUrl = process.env.API_BASE_URL || "";

export const getUserData = (id: string): Promise<undefined | UserData> => {
  return get<UserData>(`/users/${id}`)
    .then((userData) => {
      setPhaseDimension(getCurrentBusiness(userData).profileData.operatingPhase);
      return userData;
    })
    .catch(() => {
      return undefined;
    });
};

export const postUserData = async (userData: UserData): Promise<UserData> => {
  return post<UserData, UserData>(`/users`, userData).then((updatedUserData: UserData) => {
    phaseChangeAnalytics({ oldUserData: userData, newUserData: updatedUserData });
    return updatedUserData;
  });
};

export const checkLicenseStatus = (
  nameAndAddress: LicenseSearchNameAndAddress,
  licenseTaskId?: LicenseTaskID
): Promise<UserData> => {
  return post(`/license-status`, { nameAndAddress, licenseTaskId });
};

export const checkElevatorRegistrationStatus = (
  address: string,
  municipalityId: string
): Promise<ElevatorSafetyRegistrationSummary> => {
  return post(`/elevator-safety/registration`, { address, municipalityId });
};

export const checkElevatorViolations = (address: string, municipalityId: string): Promise<boolean> => {
  return post(`/elevator-safety/violations`, { address, municipalityId });
};

export const checkHousingRegistrationStatus = (
  address: string,
  municipalityId: string,
  propertyInterestType: PropertyInterestType
): Promise<HousingRegistrationRequestLookupResponse> => {
  return post(`/housing/registrations/`, { address, municipalityId, propertyInterestType });
};

export const postBusinessFormation = (
  userData: UserData,
  returnUrl: string,
  foreignGoodStandingFile: InputFile | undefined
): Promise<UserData> => {
  return post(`/formation`, { userData, returnUrl, foreignGoodStandingFile });
};

export const getCompletedFiling = (): Promise<UserData> => {
  return get(`/completed-filing`);
};

export const postTaxFilingsOnboarding = (props: {
  businessName: string;
  taxId: string;
  encryptedTaxId: string;
}): Promise<UserData> => {
  return post(`/taxFilings/onboarding`, props);
};

export const postTaxFilingsLookup = (props: {
  businessName: string;
  taxId: string;
  encryptedTaxId: string;
}): Promise<UserData> => {
  return post(`/taxFilings/lookup`, props);
};

export const decryptTaxId = (props: { encryptedTaxId: string }): Promise<string> => {
  return post(`/decrypt`, props);
};

export const postNewsletter = (userData: UserData): Promise<UserData> => {
  return post(`/external/newsletter`, userData, false);
};

export const postUserTesting = (userData: UserData): Promise<UserData> => {
  return post(`/external/userTesting`, userData, false);
};

export const postGetAnnualFilings = (userData: UserData): Promise<UserData> => {
  return post(`/guest/annualFilings`, userData, false);
};

export const searchBusinessName = (name: string): Promise<NameAvailability> => {
  return get(`/guest/business-name-availability?query=${encodeURIComponent(name)}`, false);
};

export const postSelfReg = (userData: UserData): Promise<SelfRegResponse> => {
  return axios
    .post(`${apiBaseUrl}/api/self-reg`, userData)
    .then((response) => {
      return response.data;
    })
    .catch((error: AxiosError) => {
      throw error.response?.status;
    });
};

export const get = async <T>(url: string, auth = true): Promise<T> => {
  const authHeader = auth ? await authConfig() : {};
  return axios
    .get(`${apiBaseUrl}/api${url}`, authHeader)
    .then((response) => {
      return response.data;
    })
    .catch((error: AxiosError) => {
      throw error.response?.status || 500;
    });
};

export const post = async <T, R>(url: string, data: R, auth = true): Promise<T> => {
  const authHeader = auth ? await authConfig() : {};
  return axios
    .post(`${apiBaseUrl}/api${url}`, data, authHeader)
    .then((response) => {
      return response.data;
    })
    .catch((error: AxiosError) => {
      throw error.response?.status;
    });
};

const authConfig = async (): Promise<AxiosRequestConfig> => {
  const token = await getCurrentToken();
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};
