import { DynamicsHousingPropertyInterestClient } from "@client/dynamics/housing/DynamicsHousingPropertyInterestClient";
import { HousingPropertyInterestClient } from "@client/dynamics/housing/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("DynamicsHousingPropertyInterestClient", () => {
  let client: HousingPropertyInterestClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsHousingPropertyInterestClient(DEBUG ? logger : DummyLogWriter, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const searchAddress = "address-1";
  const searchMunicipalityID = "123-456-789";

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
          ultra_propertyinterestid: "12345",
          ultra_buildingcount: 3,
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: housingPropertyInterestMockResponse });
    expect(await client.getPropertyInterest(mockAccessToken, searchAddress, searchMunicipalityID)).toEqual({
      createdOn: "2023-05-31T10:31:51Z",
      isFireSafety: true,
      isBHIRegistered: false,
      address: searchAddress,
      BHINextInspectionDueDate: "01/01/2028",
      stateCode: 0,
      id: "12345",
      buildingCount: 3,
    });
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_propertyinterests?$select=createdon,ultra_isfiresafetyproperty,ultra_isbhiregisteredproperty,ultra_streetaddress,ultra_zipcode,ultra_bhinextinspectiondue_date,ultra_bhinextreinspectiondue_state,statecode,ultra_buildingcount&$filter=(ultra_streetaddress eq '${searchAddress}' and _ultra_municipality_value eq '${searchMunicipalityID}')&$top=1`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns an empty array if no matching addresses are found", async () => {
    const housingInspectionMockResponse = {
      value: [],
    };

    mockAxios.get.mockResolvedValue({ data: housingInspectionMockResponse });
    expect(await client.getPropertyInterest(mockAccessToken, searchAddress, searchMunicipalityID)).toEqual(
      undefined
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_propertyinterests?$select=createdon,ultra_isfiresafetyproperty,ultra_isbhiregisteredproperty,ultra_streetaddress,ultra_zipcode,ultra_bhinextinspectiondue_date,ultra_bhinextreinspectiondue_state,statecode,ultra_buildingcount&$filter=(ultra_streetaddress eq '${searchAddress}' and _ultra_municipality_value eq '${searchMunicipalityID}')&$top=1`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
