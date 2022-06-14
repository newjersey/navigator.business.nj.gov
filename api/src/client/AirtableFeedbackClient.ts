import { LogWriterType } from "@libs/logWriter";
import { UserFeedbackRequest, UserIssueRequest } from "@shared/feedbackRequest";
import { UserData } from "@shared/userData";
import Airtable from "airtable";
import { FeedbackClient } from "../domain/types";

type AirtableConfig = {
  apiKey: string;
  baseId: string;
  baseUrl: string;
  feedbackTableName: string;
  issuesTableName: string;
};

export const AirtableFeedbackClient = (config: AirtableConfig, logWriter: LogWriterType): FeedbackClient => {
  Airtable.configure({
    endpointUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  const base = Airtable.base(config.baseId);
  const logId = logWriter.GetId();

  const createUserFeedback = (feedbackRequest: UserFeedbackRequest, userData: UserData): Promise<boolean> => {
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
        `Feedback - Airtable - Id:${logId} - Request Sent to base ${config.baseId} table ${
          config.feedbackTableName
        }. data: ${JSON.stringify(fields)}`
      );
      base(config.feedbackTableName).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(
            `FeedbackClient - Airtable - Id:${logId} - Table ${config.feedbackTableName} - Error Received: ${err}`
          );
          return reject();
        }
        logWriter.LogInfo(
          `FeedbackClient - Airtable - Id:${logId} - Table ${config.feedbackTableName} - Response Received: ${res}`
        );
        return resolve(true);
      });
    });
  };

  const createUserIssue = (issueRequest: UserIssueRequest, userData: UserData): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const fields = {
        Context: issueRequest.context,
        Detail: issueRequest.detail,
        Email: userData.user.email,
        Industry: userData.profileData.industryId,
        Persona: userData.profileData.businessPersona,
        "Page Report Was Initiated On": issueRequest.pageOfRequest,
        Device: issueRequest.device,
        Browser: issueRequest.browser,
        "Screen Width": issueRequest.screenWidth,
      };
      logWriter.LogInfo(
        `Feedback - Airtable - Id:${logId} - Request Sent to base ${config.baseId} table ${
          config.issuesTableName
        }. data: ${JSON.stringify(fields)}`
      );
      base(config.issuesTableName).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(
            `FeedbackClient - Airtable - Id:${logId} - Table ${config.issuesTableName} - Error Received: ${err}`
          );
          return reject();
        }
        logWriter.LogInfo(
          `FeedbackClient - Airtable - Id:${logId} - Table ${config.issuesTableName} - Response Received: ${res}`
        );
        return resolve(true);
      });
    });
  };

  return { createUserFeedback, createUserIssue };
};
