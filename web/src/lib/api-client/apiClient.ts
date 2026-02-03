import { getCurrentToken } from "@/lib/auth/sessionHelper";
import { phaseChangeAnalytics, setPhaseDimension } from "@/lib/utils/analytics-helpers";
import {
  CrtkBusinessDetails,
  CrtkEmailMetadata,
  ElevatorSafetyRegistrationSummary,
  EmailMetaData,
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitSubmitResponse,
  EmployerRatesRequest,
  EmployerRatesResponse,
  FacilityDetails,
  getCurrentBusiness,
  HousingRegistrationRequestLookupResponse,
  InputFile,
  LicenseSearchNameAndAddress,
  NameAvailability,
  PreparePaymentResponse,
  PropertyInterestType,
  TaxClearanceCertificateResponse,
  UnlinkTaxIdResponse,
  UserData,
} from "@businessnjgovnavigator/shared";
import { SelfRegResponse } from "@businessnjgovnavigator/shared/types";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const apiBaseUrl = process.env.API_BASE_URL || "";

export const getUserData = async (id: string): Promise<UserData> => {
  return get<UserData>(`/users/${id}`).then((userData) => {
    setPhaseDimension(getCurrentBusiness(userData).profileData.operatingPhase);
    return userData;
  });
};

export const postUserData = async (userData: UserData): Promise<UserData> => {
  return post<UserData, UserData>(`/users`, userData).then((updatedUserData: UserData) => {
    phaseChangeAnalytics({ oldUserData: userData, newUserData: updatedUserData });
    return updatedUserData;
  });
};

type EmailCheckResponse = {
  email: string;
  found: boolean;
};
export const postUserEmailCheck = async (email: string): Promise<EmailCheckResponse> => {
  return post("/users/emailCheck", { email }, false);
};

export const checkLicenseStatus = (
  nameAndAddress: LicenseSearchNameAndAddress,
): Promise<UserData> => {
  return post(`/license-status`, { nameAndAddress });
};

export const checkElevatorRegistrationStatus = (
  address: string,
  municipalityId: string,
): Promise<ElevatorSafetyRegistrationSummary> => {
  return post(`/elevator-safety/registration`, { address, municipalityId });
};

export const checkElevatorViolations = (
  address: string,
  municipalityId: string,
): Promise<boolean> => {
  return post(`/elevator-safety/violations`, { address, municipalityId });
};

export const checkHousingRegistrationStatus = (
  address: string,
  municipalityId: string,
  propertyInterestType: PropertyInterestType,
): Promise<HousingRegistrationRequestLookupResponse> => {
  return post(`/housing/registrations/`, { address, municipalityId, propertyInterestType });
};

export const checkXrayRegistrationStatus = (
  facilityDetails: FacilityDetails,
): Promise<UserData> => {
  return post(`/xray-registration`, { facilityDetails });
};

export const searchBuisnessInCrtkDB = (
  crtkBusinessDetails: CrtkBusinessDetails,
): Promise<UserData> => {
  return post(`/crtk-lookup`, { crtkBusinessDetails });
};

export const sendEnvironmentPermitEmail = (emailMetaData: EmailMetaData): Promise<string> => {
  return post(`/guest/environment-permit-email`, { emailMetaData }, false);
};

export const sendCrtkActivitiesEmail = (emailMetaData: CrtkEmailMetadata): Promise<string> => {
  return post(`/crtk-email`, { emailMetaData });
};

export const postBusinessFormation = (
  userData: UserData,
  returnUrl: string,
  foreignGoodStandingFile: InputFile | undefined,
): Promise<UserData> => {
  return post(`/formation`, { userData, returnUrl, foreignGoodStandingFile });
};

export const getCompletedFiling = (): Promise<UserData> => {
  return get(`/completed-filing`);
};

export const postTaxClearanceCertificate = (
  userData: UserData,
): Promise<TaxClearanceCertificateResponse> => {
  return post(`/postTaxClearanceCertificate`, userData);
};

export const postCigaretteLicensePreparePayment = (
  userData: UserData,
  returnUrl: string,
): Promise<{ userData: UserData; paymentInfo: PreparePaymentResponse }> => {
  return post(`/cigarette-license/prepare-payment`, { userData, returnUrl });
};

export const cigaretteLicenseConfirmPayment = (): Promise<UserData> => {
  return get(`/cigarette-license/get-order-by-token`);
};

export const unlinkTaxId = (userData: UserData): Promise<UnlinkTaxIdResponse> => {
  return post(`/unlinkTaxId`, userData);
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

export const checkEmployerRates = (props: {
  employerRates: EmployerRatesRequest;
  userData: UserData;
}): Promise<EmployerRatesResponse> => {
  return post(`/checkEmployerRates`, props);
};

export const decryptValue = (props: { encryptedValue: string }): Promise<string> => {
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

export const postEmergencyTripPermitApplication = (
  applicationInfo: EmergencyTripPermitApplicationInfo,
): Promise<EmergencyTripPermitSubmitResponse> => {
  return post("/external/emergencyTripPermit", applicationInfo, false);
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
