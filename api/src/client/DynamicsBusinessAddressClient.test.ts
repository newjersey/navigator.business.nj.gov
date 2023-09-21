import axios from "axios";
import { BusinessAddressClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { DynamicsBusinessAddressClient } from "./DynamicsBusinessAddressClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsBusinessAddressClient", () => {
  let client: BusinessAddressClient;
  let logger: LogWriterType;

  let ORIGINAL_ORG_URL: string | undefined;
  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = DynamicsBusinessAddressClient(logger);

    ORIGINAL_ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    process.env.DCA_DYNAMICS_ORG_URL = ORG_URL;
  });

  afterEach(() => {
    process.env.DCA_DYNAMICS_ORG_URL = ORIGINAL_ORG_URL;
  });

  const mockBusinessId = "123456";
  const mockAccessToken = "access-granted";

  it("queries the dca dynamics business address endpoint with auth token in header", async () => {
    const businessAddressMockResponse = {
      value: [
        {
          createdo: "2023-05-31T10:31:51Z",
          rgb_city: "Washington",
          // eslint-disable-next-line unicorn/no-null
          rgb_county: null,
          rgb_name: "Apt GFG 3900A Watson Pl NW",
          rgb_state: "DC",
          rgb_street1: "Apt GFG 3900A Watson Pl NW",
          // eslint-disable-next-line unicorn/no-null
          rgb_street2: null,
          rgb_typecode: 100000000,
          rgb_zip: "20016-6739",
          statecode: 0,
          rgb_addressid: "ff166755-9eff-ed11-a81b-001dd80703e0",
        },
        {
          createdon: "2023-05-31T10:32:04Z",
          rgb_city: "Chesapeake",
          // eslint-disable-next-line unicorn/no-null
          rgb_county: null,
          rgb_name: "Trlr T 322 Ballahack Rd",
          rgb_state: "VA",
          rgb_street1: "Trlr T 322 Ballahack Rd",
          // eslint-disable-next-line unicorn/no-null
          rgb_street2: null,
          rgb_typecode: 100000001,
          rgb_zip: "23322-2479",
          statecode: 0,
          rgb_addressid: "4da7455c-9eff-ed11-a81b-001dd80703e0",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: { ...businessAddressMockResponse } });
    expect(await client.getBusinessAddresses(mockAccessToken, mockBusinessId)).toEqual([
      {
        addressLine1: "Apt GFG 3900A Watson Pl NW",
        addressCity: "Washington",
        addressState: "DC",
        addressCounty: "",
        addressZipCode: "20016-6739",
      },
      {
        addressLine1: "Trlr T 322 Ballahack Rd",
        addressCity: "Chesapeake",
        addressState: "VA",
        addressCounty: "",
        addressZipCode: "23322-2479",
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,rgb_city,rgb_county,rgb_name,rgb_state,rgb_street1,rgb_street2,rgb_typecode,rgb_zip,statecode&$filter=(_rgb_businessid_value eq ${mockBusinessId})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("only returns addresses that are active", async () => {
    const businessAddressMockResponse = {
      value: [
        {
          createdo: "2023-05-31T10:31:51Z",
          rgb_city: "Washington",
          // eslint-disable-next-line unicorn/no-null
          rgb_county: null,
          rgb_name: "Apt GFG 3900A Watson Pl NW",
          rgb_state: "DC",
          rgb_street1: "Apt GFG 3900A Watson Pl NW",
          // eslint-disable-next-line unicorn/no-null
          rgb_street2: null,
          rgb_typecode: 100000000,
          rgb_zip: "20016-6739",
          statecode: 0,
          rgb_addressid: "ff166755-9eff-ed11-a81b-001dd80703e0",
        },
        {
          createdon: "2023-05-31T10:32:04Z",
          rgb_city: "Chesapeake",
          // eslint-disable-next-line unicorn/no-null
          rgb_county: null,
          rgb_name: "Trlr T 322 Ballahack Rd",
          rgb_state: "VA",
          rgb_street1: "Trlr T 322 Ballahack Rd",
          // eslint-disable-next-line unicorn/no-null
          rgb_street2: null,
          rgb_typecode: 100000001,
          rgb_zip: "23322-2479",
          statecode: 1,
          rgb_addressid: "4da7455c-9eff-ed11-a81b-001dd80703e0",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: { ...businessAddressMockResponse } });
    expect(await client.getBusinessAddresses(mockAccessToken, mockBusinessId)).toEqual([
      {
        addressLine1: "Apt GFG 3900A Watson Pl NW",
        addressCity: "Washington",
        addressState: "DC",
        addressCounty: "",
        addressZipCode: "20016-6739",
      },
    ]);
  });

  it("returns empty array if returned data is empty", async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    expect(await client.getBusinessAddresses(mockAccessToken, mockBusinessId)).toEqual([]);
  });
});
