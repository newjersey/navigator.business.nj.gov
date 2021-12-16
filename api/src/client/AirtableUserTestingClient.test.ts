/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Airtable from "airtable";
import dayjs from "dayjs";
import { generateUser } from "../../test/factories";
import { UserTestingClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { AirtableUserTestingClient } from "./AirtableUserTestingClient";

type MockAirtableType = {
  baseIdCalledWith: string;
  tableIdCalledWith: string;
  dataCalledWith: any;
  base: (baseId: string) => (tableId: string) => void;
  configure: (endpointUrl: string, apiKey: string) => void;
};

jest.mock("winston");
const mockAirtable = Airtable as unknown as jest.Mocked<MockAirtableType>;

describe("AirtableUserTestingClient", () => {
  let client: UserTestingClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
    client = AirtableUserTestingClient(
      {
        apiKey: "some-api-key",
        baseId: "some-base-id",
        baseUrl: "some-base-url",
      },
      logger
    );
  });

  it("sends user data to airtable", async () => {
    const user = generateUser({});
    const result = await client.add(user);
    expect(result).toEqual({ success: true });
    expect(mockAirtable.baseIdCalledWith).toEqual("some-base-id");
    expect(mockAirtable.tableIdCalledWith).toEqual("Users");
    expect(mockAirtable.dataCalledWith).toEqual([
      {
        fields: {
          "Email Address": user.email,
          "First Name": user.name,
          "Registration Date": dayjs().format("YYYY-MM-DD"),
          Source: "Opted In Navigator",
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
