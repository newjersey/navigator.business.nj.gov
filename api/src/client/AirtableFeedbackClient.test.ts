/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateUserData } from "@shared/test";
import * as Airtable from "airtable";
import { generateFeedbackRequest, generateIssueRequest } from "../../test/factories";
import { FeedbackClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { AirtableFeedbackClient } from "./AirtableFeedbackClient";

type MockAirtableType = {
  baseIdCalledWith: string;
  tableIdCalledWith: string;
  dataCalledWith: any;
  base: (baseId: string) => (tableId: string) => void;
  configure: (endpointUrl: string, apiKey: string) => void;
};

jest.mock("winston");
const mockAirtable = Airtable as unknown as jest.Mocked<MockAirtableType>;

describe("AirtableFeedbackClient", () => {
  let client: FeedbackClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = AirtableFeedbackClient(
      {
        apiKey: "some-api-key",
        baseId: "some-base-id",
        baseUrl: "some-base-url",
        feedbackTableName: "some-feedback-table",
        issuesTableName: "some-issues-table",
      },
      logger
    );
  });

  it("sends user data and feedback request to airtable", async () => {
    const userData = generateUserData({});
    const feedbackRequest = generateFeedbackRequest({});
    const result = await client.createUserFeedback(feedbackRequest, userData);

    expect(result).toEqual(true);

    expect(mockAirtable.baseIdCalledWith).toEqual("some-base-id");
    expect(mockAirtable.tableIdCalledWith).toEqual("some-feedback-table");
    expect(mockAirtable.dataCalledWith).toEqual([
      {
        fields: {
          Detail: feedbackRequest.detail,
          Email: userData.user.email,
          Industry: userData.profileData.industryId,
          Persona: userData.profileData.businessPersona,
          "Page Report Was Initiated On": feedbackRequest.pageOfRequest,
          Device: feedbackRequest.device,
          Browser: feedbackRequest.browser,
          "Screen Width": feedbackRequest.screenWidth,
          "Guest/Logged In": "Guest",
          UserId: userData.user.id,
          "Legal Structure": userData.profileData.legalStructureId,
        },
      },
    ]);
  });

  it("sends user data and issue request to airtable", async () => {
    const userData = generateUserData({});
    const issue = generateIssueRequest({});
    const result = await client.createUserIssue(issue, userData);

    expect(result).toEqual(true);

    expect(mockAirtable.baseIdCalledWith).toEqual("some-base-id");
    expect(mockAirtable.tableIdCalledWith).toEqual("some-issues-table");
    expect(mockAirtable.dataCalledWith).toEqual([
      {
        fields: {
          Context: issue.context,
          Detail: issue.detail,
          Email: userData.user.email,
          Industry: userData.profileData.industryId,
          Persona: userData.profileData.businessPersona,
          "Page Report Was Initiated On": issue.pageOfRequest,
          Device: issue.device,
          Browser: issue.browser,
          "Screen Width": issue.screenWidth,
          "Guest/Logged In": "Guest",
          UserId: userData.user.id,
          "Legal Structure": userData.profileData.legalStructureId,
        },
      },
    ]);
  });
});

jest.mock("airtable", (): MockAirtableType => {
  return {
    baseIdCalledWith: "",
    tableIdCalledWith: "",
    dataCalledWith: undefined,
    base: function MockBase(baseId: string): any {
      this.baseIdCalledWith = baseId;
      return (tableId: string): any => {
        this.tableIdCalledWith = tableId;
        // eslint-disable-next-line unicorn/consistent-function-scoping
        const create = (newData: any, callback: (err?: any, results?: any) => void): void => {
          this.dataCalledWith = newData;
          callback();
        };

        return { create };
      };
    },
    configure: function MockConfigure(): any {},
  };
});
