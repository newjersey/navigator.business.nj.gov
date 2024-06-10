import { DynamicsHotelMotelRegistrationClient } from "@client/dynamics/housing/DynamicsHousingHotelMotelRegistrationClient";
import { HotelMotelRegistrationClient } from "@client/dynamics/housing/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsHousingPropertyInterestClient", () => {
  let client: HotelMotelRegistrationClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsHotelMotelRegistrationClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const propertyInterestID = "property-interest-3";
  const buildingCount = 4;

  it("makes a successful get request and returns registration data sorted by date", async () => {
    const housingHotelMotelRegistrationMockResponse = {
      value: [
        {
          ultra_bhiregistrationrequestid: "123",
          ultra_requestdate: "06/06/2000",
          statuscode: "2",
          ultra_propertyinteresttype: "100",
        },
        {
          ultra_bhiregistrationrequestid: "456",
          ultra_requestdate: "06/06/2020",
          statuscode: "2",
          ultra_propertyinteresttype: "100",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: housingHotelMotelRegistrationMockResponse });
    expect(
      await client.getHotelMotelRegistration(mockAccessToken, propertyInterestID, buildingCount)
    ).toEqual([
      {
        buildingCount: 4,
        date: "06/06/2020",
        id: "456",
        propertyInterestType: "100",
        status: "Approved",
      },
      {
        buildingCount: 4,
        date: "06/06/2000",
        id: "123",
        propertyInterestType: "100",
        status: "Approved",
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_bhiregistrationrequests?$select=ultra_bhiregistrationrequestid,ultra_requestdate,statuscode,ultra_propertyinteresttype&$filter=(_ultra_linktoexistingpropertyinterest_value eq '${propertyInterestID}' and (ultra_propertyinteresttype eq 240000001 or ultra_propertyinteresttype eq 240000016))`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns empty array if there is no registrations found", async () => {
    const housingHotelMotelRegistrationMockResponse = {
      value: [],
    };

    mockAxios.get.mockResolvedValue({ data: housingHotelMotelRegistrationMockResponse });
    expect(
      await client.getHotelMotelRegistration(mockAccessToken, propertyInterestID, buildingCount)
    ).toEqual([]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_bhiregistrationrequests?$select=ultra_bhiregistrationrequestid,ultra_requestdate,statuscode,ultra_propertyinteresttype&$filter=(_ultra_linktoexistingpropertyinterest_value eq '${propertyInterestID}' and (ultra_propertyinteresttype eq 240000001 or ultra_propertyinteresttype eq 240000016))`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
