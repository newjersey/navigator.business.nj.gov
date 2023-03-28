/* eslint-disable @typescript-eslint/no-explicit-any */
import { getCurrentDateFormatted } from "@shared/dateHelpers";
import * as Airtable from "airtable";
import { generateProfileData, generateUser } from "../../test/factories";
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
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
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
    const profileData = generateProfileData({});
    const result = await client.add(user, profileData);
    expect(result).toEqual({ success: true, status: "SUCCESS" });
    expect(mockAirtable.baseIdCalledWith).toEqual("some-base-id");
    expect(mockAirtable.tableIdCalledWith).toEqual("some-users-table");
    expect(mockAirtable.dataCalledWith).toEqual([
      {
        fields: {
          "Email Address": user.email,
          "First Name": user.name,
          Persona: profileData.businessPersona,
          "Sub-Persona": profileData.foreignBusinessType,
          Industry: profileData.industryId,
          Sector: profileData.sectorId,
          "Registration Date": getCurrentDateFormatted("YYYY-MM-DD"),
          Source: "Opted In Navigator",
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
