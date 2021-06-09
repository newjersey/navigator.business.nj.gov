import { LicenseEntity, LicenseStatusClient } from "../domain/types";
import axios, { AxiosError } from "axios";

export const WebserviceLicenseStatusClient = (baseUrl: string): LicenseStatusClient => {
  const search = (name: string, zipCode: string, licenseType: string): Promise<LicenseEntity[]> => {
    return axios
      .post(`${baseUrl}/ws/getLicenseStatus`, {
        zipCode: zipCode,
        businessName: name,
        licenseType: licenseType,
      })
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        console.log(error);
        return Promise.reject(error.response?.status);
      });
  };

  return {
    search,
  };
};
