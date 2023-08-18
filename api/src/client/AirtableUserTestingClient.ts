import { LogWriterType } from "@libs/logWriter";
import { BusinessUser, UserTestingResponse } from "@shared/businessUser";
import { getCurrentDateFormatted } from "@shared/dateHelpers";
import { ProfileData } from "@shared/profileData";
import Airtable from "airtable";
import { UserTestingClient } from "../domain/types";

type AirtableConfig = {
  apiKey: string;
  baseId: string;
  baseUrl: string;
  usersTableName: string;
};

export const AirtableUserTestingClient = (
  config: AirtableConfig,
  logWriter: LogWriterType
): UserTestingClient => {
  Airtable.configure({
    endpointUrl: config.baseUrl,
    apiKey: config.apiKey
  });

  const logId = logWriter.GetId();
  const base = Airtable.base(config.baseId);

  const add = (user: BusinessUser, profileData: ProfileData): Promise<UserTestingResponse> => {
    return new Promise((resolve) => {
      const fields = {
        "Email Address": user.email,
        "First Name": user.name,
        Persona: profileData.businessPersona,
        "Sub-Persona": profileData.foreignBusinessType,
        Industry: profileData.industryId,
        Sector: profileData.sectorId,
        "Registration Date": getCurrentDateFormatted("YYYY-MM-DD"),
        Source: "Opted In Navigator"
      };
      logWriter.LogInfo(
        `UserResearch - Airtable - Id:${logId} - Request Sent to base ${config.baseId} table ${
          config.usersTableName
        }. data: ${JSON.stringify(fields)}`
      );
      base(config.usersTableName).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(
            `UserResearchClient - Airtable - Id:${logId} - Error Received: ${JSON.stringify(err)}`
          );
          return resolve({ success: false, status: "RESPONSE_ERROR" });
        }
        logWriter.LogInfo(
          `UserResearchClient - Airtable - Id:${logId} - Response Received: ${JSON.stringify(res)}`
        );
        return resolve({ success: true, status: "SUCCESS" });
      });
    });
  };

  return { add };
};
