import { LicenseEntity, LicenseStatusClient } from "../domain/types";
import axios, { AxiosError } from "axios";

export const WebserviceLicenseStatusClient = (baseUrl: string): LicenseStatusClient => {
  const search = (name: string, zipCode: string, licenseType: string): Promise<LicenseEntity[]> => {
    const url = `${baseUrl}/ws/simple/queryLicenseStatus`;
    return axios
      .post(url, {
        zipCode: zipCode,
        businessName: name,
        licenseType: licenseType,
      })
      .then((response) => {
        console.log("got response", response);
        return response.data || [];
      })
      .catch((error: AxiosError) => {
        console.log("got error", error);
        return Promise.reject(error.response?.status);
      });
  };

  return {
    search,
  };
};
