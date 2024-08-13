/* eslint-disable unicorn/no-null */
import { RegulatedBusinessDynamicsBusinessAddressesClient } from "@client/dynamics/license-status/RegulatedBusinessDynamicsBusinessAddressesClient";
import { BusinessAddressesClient } from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseSearchAddress } from "@shared/test";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("RegulatedBusinessDynamicsBusinessAddressClient", () => {
  let client: BusinessAddressesClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = RegulatedBusinessDynamicsBusinessAddressesClient(DEBUG ? logger : DummyLogWriter, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const mockBusinessIds = [
    {
      businessId: "id2",
      name: "Business 1",
    },
    {
      businessId: "id3",
      name: "Business 2",
    },
  ];

  it("makes a get request to dynamics api with business address query and auth token in header", async () => {
    const businessAddressMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          rgb_city: "Washington",
          rgb_county: null,
          rgb_name: "Business 1",
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
          rgb_name: "Business 2",
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
    expect(await client.getBusinessAddressesForAllBusinessIds(mockAccessToken, mockBusinessIds)).toEqual([
      {
        businessId: "id2",
        name: "Business 1",
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
        name: "Business 2",
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
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${mockBusinessIds[0].businessId})`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenNthCalledWith(
      2,
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${mockBusinessIds[1].businessId})`,
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
          rgb_name: "Business 1",
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
          rgb_name: "Business 2",
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
    expect(await client.getBusinessAddressesForAllBusinessIds(mockAccessToken, mockBusinessIds)).toEqual([
      {
        businessId: "id2",
        name: "Business 1",
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
        name: "Business 2",
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
    expect(await client.getBusinessAddressesForAllBusinessIds(mockAccessToken, mockBusinessIds)).toEqual([
      {
        businessId: "id2",
        addresses: [],
        name: "Business 1",
      },
      {
        businessId: "id3",
        addresses: [],
        name: "Business 2",
      },
    ]);
  });

  it("throws status error when api call fails", async () => {
    mockAxios.get.mockRejectedValue({
      response: { status: 500 },
    });

    await expect(
      client.getBusinessAddressesForAllBusinessIds(mockAccessToken, mockBusinessIds)
    ).rejects.toEqual(500);
  });
});
