import { TaxClearanceCertificateResponse } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { LookupTaxClearanceCertificateAgenciesById } from "@shared/taxClearanceCertificate";
import { UserData } from "@shared/userData";
import axios from "axios";

export interface TaxClearanceCertificateClient {
  postTaxClearanceCertificate: (userData: UserData) => Promise<TaxClearanceCertificateResponse>;
}

type Config = {
  orgUrl: string;
  userName: string;
  password: string;
};

export const ApiTaxClearanceCertificateClient = (
  logWriter: LogWriterType,
  config: Config
): TaxClearanceCertificateClient => {
  const postTaxClearanceCertificate = async (
    userData: UserData
  ): Promise<TaxClearanceCertificateResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Tax Clearance Certificate Client - Id:${logId}`);
    const currTaxClearanceData = userData.businesses[userData.currentBusinessId].taxClearanceCertificateData;

    const postBody = {
      repId: userData.user.id,
      repName: userData.user.name,
      taxpayerId: currTaxClearanceData.taxId,
      taxpayerPin: currTaxClearanceData.taxPin,
      taxpayerName: currTaxClearanceData.businessName,
      addressLine1: currTaxClearanceData.addressLine1,
      addressLine2: currTaxClearanceData.addressLine2,
      city: currTaxClearanceData.addressCity,
      state: currTaxClearanceData.addressState?.shortCode,
      zip: currTaxClearanceData.addressZipCode,
      agencyName: LookupTaxClearanceCertificateAgenciesById(currTaxClearanceData.requestingAgencyId).name,
    };

    logWriter.LogInfo(
      `Tax Clearance Certificate Client - Id:${logId} - Request Sent to ${
        config.orgUrl
      }/TYTR_ACE_App/ProcessCertificate/businessClearance data: ${JSON.stringify(postBody)}`
    );

    try {
      const response = await axios.post(
        `${config.orgUrl}/TYTR_ACE_App/ProcessCertificate/businessClearance`,
        postBody,
        {
          auth: {
            username: config.userName,
            password: config.password,
          },
        }
      );

      logWriter.LogInfo(
        `Tax Clearance Certificate Client - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
      );
      return { certificatePdfArray: response.data.certificate };
    } catch {
      // TODO: Log tne error response
      // TODO: Missing Field Error
      // TODO: Validation Error
      // TODO: Server Error
      return {};
    }
  };

  return { postTaxClearanceCertificate };
};
