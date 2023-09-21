import { LogWriterType } from "@libs/logWriter";
import axios, { AxiosError } from "axios";
import { BusinessAddressClient, BusinessAddressResponse } from "../domain/types";

export const DynamicsBusinessAddressClient = (logWriter: LogWriterType): BusinessAddressClient => {
  const getBusinessAddresses = async (
    accessToken: string,
    businessId: string
  ): Promise<BusinessAddressResponse[]> => {
    const ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Business Address Client - Id:${logId}`);
    return axios
      .get(
        `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${businessId})&$top=50`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
      .then((response) => {
        logWriter.LogInfo(
          `Dynamics Business Address Client - Id:${logId} - Response: ${JSON.stringify(response.data)}`
        );
        return response.data.value
          ? response.data.value
              .filter((address: DynamicsApiAddressResponse) => address.statecode === 0)
              .map((address: DynamicsApiAddressResponse) => processAddress(address))
          : [];
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Business Address Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  return {
    getBusinessAddresses,
  };
};

type DynamicsApiAddressResponse = {
  createdo: string;
  rgb_city: string;
  rgb_county: string;
  rgb_name: string;
  rgb_state: string;
  rgb_street1: string;
  rgb_street2: string;
  rgb_typecode: number;
  rgb_zip: string;
  statecode: number;
  rgb_addressid: string;
};

const processAddress = (address: DynamicsApiAddressResponse): BusinessAddressResponse => {
  return {
    addressLine1: address.rgb_name || "",
    addressCity: address.rgb_city || "",
    addressState: address.rgb_state || "",
    addressCounty: address.rgb_county || "",
    addressZipCode: address.rgb_zip || "",
  };
};
