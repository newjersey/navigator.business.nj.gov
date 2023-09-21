import axios from "axios";
import { LicenseApplicationIdClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { DynamicsLicenseApplicationIdClient } from "./DynamicsLicenseApplicationIdClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsLicenseApplicationIdClient", () => {
  let client: LicenseApplicationIdClient;
  let logger: LogWriterType;

  let ORIGINAL_ORG_URL: string | undefined;
  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = DynamicsLicenseApplicationIdClient(logger);

    ORIGINAL_ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    process.env.DCA_DYNAMICS_ORG_URL = ORG_URL;
  });

  afterEach(() => {
    process.env.DCA_DYNAMICS_ORG_URL = ORIGINAL_ORG_URL;
  });

  const mockBusinessId = "123456";
  const mockAccessToken = "access-granted";
  const telemarketersLicenseTypeId = "7e957057-53df-eb11-bacb-001dd8028561";

  it("queries the dca dynamics license application id endpoint with auth token in header", async () => {
    const mockLicenseApplicationIdResponse = {
      value: [
        {
          rgb_appnumber: "TELI00030564",
          rgb_number: null,
          rgb_startdate: null,
          rgb_versioncode: 100000000,
          rgb_expirationdate: null,
          statecode: 0,
          statuscode: 100000005,
          rgb_applicationid: "license-id-135",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: { ...mockLicenseApplicationIdResponse } });
    expect(await client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Telemarketers")).toEqual({
      applicationNumber: "TELI00030564",
      licenseNumber: "",
      issueDate: "",
      expirationDate: "",
      applicationId: "license-id-1357",
      licenseStatusCode: 100000005,
    });
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_applications?$select=rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${mockBusinessId} and _rgb_apptypeid_value eq ${telemarketersLicenseTypeId})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  // it("returns empty string if data is empty", async () => {
  //   mockAxios.get.mockResolvedValue({ data: {} });
  //   expect(await client.getBusinessId(mockAccessToken, mockNametoSearch)).toEqual("");
  // });
});
