import { BusinessUser, UserTestingClient, UserTestingResponse } from "../domain/types";
import dayjs from "dayjs";
import Airtable from "airtable";
import { LogWriterType } from "@libs/logWriter";

type AirtableConfig = {
  apiKey: string;
  baseId: string;
  baseUrl: string;
};

export const AirtableUserTestingClient = (
  config: AirtableConfig,
  logWriter: LogWriterType
): UserTestingClient => {
  const table = "Users";

  Airtable.configure({
    endpointUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  const base = Airtable.base(config.baseId);

  const add = (user: BusinessUser): Promise<UserTestingResponse> => {
    return new Promise((resolve) => {
      const fields = {
        "Email Address": user.email,
        "First Name": user.name,
        "Registration Date": dayjs().format("YYYY-MM-DD"),
        Source: "Opted In Navigator",
      };
      logWriter.LogInfo(
        `UserResearch - Airtable - Request Sent to base ${config.baseId} table ${table}. data: ${fields}`
      );
      base(table).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(`UserResearchClient - Airtable - Error Received: ${err}`);
          return resolve({ success: false });
        }
        logWriter.LogInfo(`UserResearchClient - Airtable - Response Received: ${res}`);
        return resolve({ success: true });
      });
    });
  };

  return { add };
};
