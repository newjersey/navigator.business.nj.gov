import {
  ACTIVE_STATECODE,
  BusinessAddressClient,
  BusinessIdAndLicenseSearchAddresses,
} from "@client/dynamics/license-status/types";
import { LogWriterType } from "@libs/logWriter";
import { LicenseSearchAddress } from "@shared/license";
import axios, { AxiosError } from "axios";

export const DynamicsBusinessAddressClient = (
  logWriter: LogWriterType,
  orgUrl: string
): BusinessAddressClient => {
  const getBusinessAddresses = async (
    accessToken: string,
    businessId: string
  ): Promise<LicenseSearchAddress[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Dynamics Business Address Client - Id:${logId}`);

    return axios
      .get(
        `${orgUrl}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${businessId})&$top=50`,
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
        const activeAddresses = response.data.value.filter(
          (address: DynamicsApiAddressResponse) => address.statecode === ACTIVE_STATECODE
        );
        return activeAddresses.map((address: DynamicsApiAddressResponse) => processAddress(address));
      })
      .catch((error: AxiosError) => {
        logWriter.LogError(`Dynamics Business Address Client - Id:${logId} - Error:`, error);
        throw error.response?.status;
      });
  };

  const getBusinessIdsAndLicenseSearchAddresses = async (
    accessToken: string,
    businessIds: string[]
  ): Promise<BusinessIdAndLicenseSearchAddresses[]> => {
    const getBusinessAddressesById = async (id: string): Promise<BusinessIdAndLicenseSearchAddresses> => {
      return {
        businessId: id,
        addresses: await getBusinessAddresses(accessToken, id),
      };
    };

    return await Promise.all(businessIds.map((id) => getBusinessAddressesById(id)));
  };

  return {
    getBusinessIdsAndLicenseSearchAddresses,
  };
};

type DynamicsApiAddressResponse = {
  createdon: string;
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

const processAddress = (address: DynamicsApiAddressResponse): LicenseSearchAddress => {
  return {
    addressLine1: address.rgb_street1 || "",
    addressLine2: address.rgb_street2 || "",
    zipCode: address.rgb_zip.slice(0, 5) || "",
  };
};
