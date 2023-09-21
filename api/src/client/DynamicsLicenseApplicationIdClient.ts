import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";
import { LicenseApplicationIdClient, LicenseApplicationResponse } from "../domain/types";

export const DynamicsLicenseApplicationIdClient = (logWriter: LogWriterType): LicenseApplicationIdClient => {
  const getLicenseApplicationId = (
    accessToken: string,
    businessId: string,
    industryName: string
  ): Promise<LicenseApplicationResponse> => {
    const ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics License Application Id Client - Id:${logId}`);
    return axios
      .get(
        `${ORG_URL}/api/data/v9.2/rgb_applications?$select=rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${businessId} and _rgb_apptypeid_value eq ${industry})&$top=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics License Application Id Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );
        return response.data.value ? response.data.value[0] : {};
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics License Application Id Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getLicenseApplicationId,
  };
};

const industrytoLicenseType = (industryValue: ) => {

};

type LicenseApplicationIdApiResponse = {
  rgb_appnumber: string;
  rgb_number: string;
  rgb_startdate: string;
  rgb_versioncode: number;
  rgb_expirationdate: string;
  statecode: number;
  statuscode: number;
  rgb_applicationid: string;
};

const transformApiResponse = (response: LicenseApplicationIdApiResponse): LicenseApplicationResponse => {
  return {
    applicationNumber: response.rgb_appnumber,
    licenseNumber: response.rgb_number,
    issueDate: response.rgb_startdate,
    expirationDate: response.rgb_expirationdate,
    applicationId: response.rgb_applicationid,
    licenseStatusCode: response.statuscode,
  };
};
