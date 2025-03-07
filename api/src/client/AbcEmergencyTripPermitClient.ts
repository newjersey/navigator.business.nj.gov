import { ApiConfig, getApiSubmissionBody } from "@client/AbcEmergencyTripPermitHelpers";
import { EmergencyTripPermitClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitSubmitResponse,
} from "@shared/emergencyTripPermit";
import axios from "axios";

export const AbcEmergencyTripPermitClient = (
  config: ApiConfig,
  logger: LogWriterType
): EmergencyTripPermitClient => {
  const logId = logger.GetId();
  const apply = (
    applicationInfo: EmergencyTripPermitApplicationInfo
  ): Promise<EmergencyTripPermitSubmitResponse> => {
    const postBody = getApiSubmissionBody(applicationInfo, config);
    const postContentType = "text/plain";

    logger.LogInfo(
      `Emergency Trip Permit - ABC - Id:${logId} - ${postContentType} Request Sent to ${
        config.baseUrl
      }/GetCompletedFiling data: ${JSON.stringify(postBody)}`
    );

    return axios
      .post(`${config.baseUrl}/GetCompletedFiling`, postBody, {
        headers: {
          "Content-Type": postContentType,
        },
      })
      .then((response) => {
        logger.LogInfo(
          `Emergency Trip Permit - ABC - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
        );
        if (response.data.Success && response.data.Success === true) {
          return response.data as EmergencyTripPermitSubmitResponse;
        } else {
          logger.LogInfo(
            `Emergency Trip Permit - ABC - Id:${logId} - Response error received: ${JSON.stringify(
              response.data
            )}`
          );
          return response.data as EmergencyTripPermitSubmitResponse;
        }
      })
      .catch((error) => {
        logger.LogError(
          `Emergency Trip Permit - ABC - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
        );
        return error.data as EmergencyTripPermitSubmitResponse;
      });
  };

  return {
    apply,
  };
};
