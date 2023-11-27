import { DynamicsHousingPropertyInterestClient } from "@client/dynamics/housing/DynamicsHousingPropertyInterestClient";
import { HousingPropertyInterestClient } from "@client/dynamics/housing/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsHousingPropertyInterestClient", () => {
  let client: HousingPropertyInterestClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsHousingPropertyInterestClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const searchAddress = "address-1";

  it("makes a successful get request and returns inspection data", async () => {
    const housingPropertyInterestMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          ultra_isfiresafetyproperty: true,
          ultra_isbhiregisteredproperty: false,
          ultra_zipcode: "12345",
          ultra_bhinextinspectiondue_date: "01/01/2028",
          statecode: 0,
          ultra_streetaddress: searchAddress,
        },
        {
          createdon: "2023-06-31T10:31:51Z",
          ultra_isfiresafetyproperty: true,
          ultra_isbhiregisteredproperty: true,
          ultra_zipcode: "12345",
          ultra_bhinextinspectiondue_date: "01/01/2030",
          statecode: 1,
          ultra_streetaddress: searchAddress,
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: housingPropertyInterestMockResponse });
    expect(await client.getPropertyInterestsByAddress(mockAccessToken, searchAddress)).toEqual([
      {
        createdOn: "2023-05-31T10:31:51Z",
        isFireSafety: true,
        isBHIRegistered: false,
        address: searchAddress,
        BHINextInspectionDueDate: "01/01/2028",
        stateCode: 0,
      },
      {
        createdOn: "2023-06-31T10:31:51Z",
        isFireSafety: true,
        isBHIRegistered: true,
        address: searchAddress,
        BHINextInspectionDueDate: "01/01/2030",
        stateCode: 1,
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_propertyinterests?$select=createdon,ultra_isfiresafetyproperty,ultra_isbhiregisteredproperty,ultra_streetaddress,ultra_zipcode,ultra_bhinextinspectiondue_date,ultra_bhinextreinspectiondue_state,statecode&$filter=(ultra_streetaddress eq ${searchAddress})&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns an empty array if no matching addresses are found", async () => {
    const fireSafetyInspectionMockResponse = {
      value: [],
    };

    mockAxios.get.mockResolvedValue({ data: fireSafetyInspectionMockResponse });
    expect(await client.getPropertyInterestsByAddress(mockAccessToken, searchAddress)).toEqual([]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_propertyinterests?$select=createdon,ultra_isfiresafetyproperty,ultra_isbhiregisteredproperty,ultra_streetaddress,ultra_zipcode,ultra_bhinextinspectiondue_date,ultra_bhinextreinspectiondue_state,statecode&$filter=(ultra_streetaddress eq ${searchAddress})&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
