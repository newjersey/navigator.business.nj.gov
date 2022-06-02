import { LogWriterType } from "@libs/logWriter";
import { UserFeedbackRequest, UserIssueRequest } from "@shared/feedbackRequest";
import { UserData } from "@shared/userData";
import Airtable from "airtable";
import { FeedbackClient } from "../domain/types";

type AirtableConfig = {
  apiKey: string;
  baseId: string;
  baseUrl: string;
};

export const AirtableFeedbackClient = (config: AirtableConfig, logWriter: LogWriterType): FeedbackClient => {
  const userFeedbackTable = "User Feature Requests";
  const userIssuesTable = process.env.AIRTABLE_FEEDBACK_ISSUES_TABLE_NAME || "Navigator Bugs - DEV";

  Airtable.configure({
    endpointUrl: config.baseUrl,
    apiKey: config.apiKey,
  });

  const base = Airtable.base(config.baseId);

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
        `Feedback - Airtable - Request Sent to base ${
          config.baseId
        } table ${userFeedbackTable}. data: ${JSON.stringify(fields)}`
      );
      base(userFeedbackTable).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(
            `FeedbackClient - Airtable - Table ${userFeedbackTable} - Error Received: ${err}`
          );
          return reject();
        }
        logWriter.LogInfo(
          `FeedbackClient - Airtable - Table ${userFeedbackTable} - Response Received: ${res}`
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
        `Feedback - Airtable - Request Sent to base ${
          config.baseId
        } table ${userIssuesTable}. data: ${JSON.stringify(fields)}`
      );
      base(userIssuesTable).create([{ fields }], (err: unknown, res: unknown) => {
        if (err) {
          logWriter.LogInfo(`FeedbackClient - Airtable - Table ${userIssuesTable} - Error Received: ${err}`);
          return reject();
        }
        logWriter.LogInfo(`FeedbackClient - Airtable - Table ${userIssuesTable} - Response Received: ${res}`);
        return resolve(true);
      });
    });
  };

  return { createUserFeedback, createUserIssue };
};
