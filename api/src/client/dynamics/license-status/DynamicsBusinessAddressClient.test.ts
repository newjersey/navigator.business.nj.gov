/* eslint-disable unicorn/no-null */
import { DynamicsBusinessAddressClient } from "@client/dynamics/license-status/DynamicsBusinessAddressClient";
import { BusinessAddressClient } from "@client/dynamics/license-status/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseSearchAddress } from "@shared/test";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsBusinessAddressClient", () => {
  let client: BusinessAddressClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsBusinessAddressClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const mockBusinessIds = ["id2", "id3"];

  it("makes a get request to dynamics api with business address query and auth token in header", async () => {
    const businessAddressMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          rgb_city: "Washington",
          rgb_county: null,
          rgb_name: "Apt GFG 3900A Watson Pl NW",
          rgb_state: "DC",
          rgb_street1: "3900A Watson Pl NW",
          rgb_street2: "Apt GFG",
          rgb_typecode: 100000000,
          rgb_zip: "20016-6739",
          statecode: 0,
          rgb_addressid: "ff166755-9eff-ed11-a81b-001dd80703e0",
        },
        {
          createdon: "2023-05-31T10:32:04Z",
          rgb_city: "Chesapeake",
          rgb_county: null,
          rgb_name: "Trlr T 322 Ballahack Rd",
          rgb_state: "VA",
          rgb_street1: "Trlr T 322 Ballahack Rd",
          rgb_street2: null,
          rgb_typecode: 100000001,
          rgb_zip: "23322-2479",
          statecode: 0,
          rgb_addressid: "4da7455c-9eff-ed11-a81b-001dd80703e0",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: businessAddressMockResponse });
    expect(await client.getBusinessIdsAndLicenseSearchAddresses(mockAccessToken, mockBusinessIds)).toEqual([
      {
        businessId: "id2",
        addresses: [
          generateLicenseSearchAddress({
            addressLine1: "3900A Watson Pl NW",
            addressLine2: "Apt GFG",
            zipCode: "20016",
          }),
          generateLicenseSearchAddress({
            addressLine1: "Trlr T 322 Ballahack Rd",
            addressLine2: "",
            zipCode: "23322",
          }),
        ],
      },
      {
        businessId: "id3",
        addresses: [
          generateLicenseSearchAddress({
            addressLine1: "3900A Watson Pl NW",
            addressLine2: "Apt GFG",
            zipCode: "20016",
          }),
          generateLicenseSearchAddress({
            addressLine1: "Trlr T 322 Ballahack Rd",
            addressLine2: "",
            zipCode: "23322",
          }),
        ],
      },
    ]);
    expect(mockAxios.get).toHaveBeenNthCalledWith(
      1,
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${mockBusinessIds[0]})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenNthCalledWith(
      2,
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${mockBusinessIds[1]})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("filters out addresses whose statecode is not 0", async () => {
    const businessAddressMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          rgb_city: "Washington",
          rgb_county: null,
          rgb_name: "Apt GFG 3900A Watson Pl NW",
          rgb_state: "DC",
          rgb_street1: "Apt GFG 3900A Watson Pl NW",
          rgb_street2: null,
          rgb_typecode: 100000000,
          rgb_zip: "20016-6739",
          statecode: 0,
          rgb_addressid: "ff166755-9eff-ed11-a81b-001dd80703e0",
        },
        {
          createdon: "2023-05-31T10:32:04Z",
          rgb_city: "Chesapeake",
          rgb_county: null,
          rgb_name: "Trlr T 322 Ballahack Rd",
          rgb_state: "VA",
          rgb_street1: "Trlr T 322 Ballahack Rd",
          rgb_street2: null,
          rgb_typecode: 100000001,
          rgb_zip: "23322-2479",
          statecode: 1,
          rgb_addressid: "4da7455c-9eff-ed11-a81b-001dd80703e0",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: businessAddressMockResponse });
    expect(await client.getBusinessIdsAndLicenseSearchAddresses(mockAccessToken, mockBusinessIds)).toEqual([
      {
        businessId: "id2",
        addresses: [
          generateLicenseSearchAddress({
            addressLine1: "Apt GFG 3900A Watson Pl NW",
            addressLine2: "",
            zipCode: "20016",
          }),
        ],
      },
      {
        businessId: "id3",
        addresses: [
          generateLicenseSearchAddress({
            addressLine1: "Apt GFG 3900A Watson Pl NW",
            addressLine2: "",
            zipCode: "20016",
          }),
        ],
      },
    ]);
  });

  it("returns empty array if received data value is empty", async () => {
    mockAxios.get.mockResolvedValue({ data: { value: [] } });
    expect(await client.getBusinessIdsAndLicenseSearchAddresses(mockAccessToken, mockBusinessIds)).toEqual([
      {
        businessId: "id2",
        addresses: [],
      },
      {
        businessId: "id3",
        addresses: [],
      },
    ]);
  });
});
