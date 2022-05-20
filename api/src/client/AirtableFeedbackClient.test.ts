/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Airtable from "airtable";
import { generateFeedbackRequest, generateUserData } from "../../test/factories";
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
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
    client = AirtableFeedbackClient(
      {
        apiKey: "some-api-key",
        baseId: "some-base-id",
        baseUrl: "some-base-url",
      },
      logger
    );
  });

  it("sends user data to airtable", async () => {
    const userData = generateUserData({});
    const feedbackRequest = generateFeedbackRequest({});
    const result = await client.create(feedbackRequest, userData);

    expect(result).toEqual(true);

    expect(mockAirtable.baseIdCalledWith).toEqual("some-base-id");
    expect(mockAirtable.tableIdCalledWith).toEqual("User Feature Requests");
    expect(mockAirtable.dataCalledWith).toEqual([
      {
        fields: {
          Detail: feedbackRequest.detail,
          Email: userData.user.email,
          Industry: userData.profileData.industryId,
          Persona: userData.profileData.hasExistingBusiness ? "owning" : "starting",
          "Page Report Was Initiated On": feedbackRequest.pageOfRequest,
          Device: feedbackRequest.device,
          Browser: feedbackRequest.browser,
          "Screen Width": feedbackRequest.screenWidth,
        },
      },
    ]);
  });
});

jest.mock(
  "airtable",
  (): MockAirtableType => ({
    baseIdCalledWith: "",
    tableIdCalledWith: "",
    dataCalledWith: undefined,
    base: function MockBase(baseId: string) {
      this.baseIdCalledWith = baseId;
      return (tableId: string) => {
        this.tableIdCalledWith = tableId;
        const create = (newData: any, callback: (err: any, results: any) => void) => {
          this.dataCalledWith = newData;
          callback(undefined, undefined);
        };

        return { create };
      };
    },
    configure: function MockConfigure() {},
  })
);
