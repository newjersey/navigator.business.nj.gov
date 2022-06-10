/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentDateFormatted } from "@shared/dateHelpers";
import * as Airtable from "airtable";
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
        usersTableName: "some-users-table",
      },
      logger
    );
  });

  it("sends user data to airtable", async () => {
    const user = generateUser({});
    const result = await client.add(user);
    expect(result).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAirtable.baseIdCalledWith).toEqual("some-base-id");
    expect(mockAirtable.tableIdCalledWith).toEqual("some-users-table");
    expect(mockAirtable.dataCalledWith).toEqual([
      {
        fields: {
          "Email Address": user.email,
          "First Name": user.name,
          "Registration Date": getCurrentDateFormatted("YYYY-MM-DD"),
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
        // eslint-disable-next-line unicorn/consistent-function-scoping
        const create = (newData: any, callback: (err?: any, results?: any) => void) => {
          this.dataCalledWith = newData;
          callback();
        };

        return { create };
      };
    },
    configure: function MockConfigure() {},
  })
);
