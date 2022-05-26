import { LogWriterType } from "@libs/logWriter";
import { FeedbackRequest } from "@shared/feedbackRequest";
import { UserData } from "@shared/userData";
import Airtable from "airtable";
import { FeedbackClient } from "../domain/types";

type AirtableConfig = {
  apiKey: string;
  baseId: string;
  baseUrl: string;
};

export const AirtableFeedbackClient = (config: AirtableConfig, logWriter: LogWriterType): FeedbackClient => {
  const table = "User Feature Requests";

  Airtable.configure({
    endpointUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  const base = Airtable.base(config.baseId);

  const create = (feedbackRequest: FeedbackRequest, userData: UserData): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const fields = {
        Detail: feedbackRequest.detail,
        Email: userData.user.email,
        Industry: userData.profileData.industryId,
        Persona: userData.profileData.businessPersona,
        "Page Report Was Initiated On": feedbackRequest.pageOfRequest,
        Device: feedbackRequest.device,
        Browser: feedbackRequest.browser,
        "Screen Width": feedbackRequest.screenWidth,
      };
      logWriter.LogInfo(
        `Feedback - Airtable - Request Sent to base ${config.baseId} table ${table}. data: ${JSON.stringify(
          fields
        )}`
      );
      base(table).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(`FeedbackClient - Airtable - Error Received: ${err}`);
          return reject();
        }
        logWriter.LogInfo(`FeedbackClient - Airtable - Response Received: ${res}`);
        return resolve(true);
      });
    });
  };

  return { create };
};
