import { CRTKSearchClient } from "@client/dep/crtkSearchClient";
import type { CRTKSearch } from "@domain/types";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";

import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("CRTKSearchClient", () => {
  let client: CRTKSearch;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";
  const businessName = "TEST FACILITY LLC";
  const addressLine1 = "456 INDUSTRIAL PARK";
  const addressZipCode = "08901";
  const ein = "12-3456789";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    client = CRTKSearchClient(logger, ORG_URL);
  });

  describe("searchByBusinessName", () => {
    it("makes a call to the business name endpoint and returns an array of CRTK entries", async () => {
      const businessNameSearchResponse = {
        data: {
          data: [
            {
              FAC_NAME: businessName,
              PHYS_ADDR: addressLine1,
              PHYS_CITY: "NEWARK",
              PHYS_STATE: "NJ",
              PHYS_ZIP: addressZipCode,
              FEIN: ein,
              FAC_ID: "FAC-12345",
              SIC_CODE: "2834",
              NAICS_CODE: "325412",
              DESCRIPTION_1: "Pharmaceutical Preparation Manufacturing",
              BUSINESS_ACTIVITY: "Manufacturing",
              "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)":
                "REGULATED",
              "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)":
                "ACTIVE",
              "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)":
                "CRTK/RPPR",
              "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)":
                "USER",
              RCVD: "01/15/2024",
            },
            {
              FAC_NAME: businessName,
              PHYS_ADDR: "789 ANOTHER STREET",
              PHYS_CITY: "JERSEY CITY",
              PHYS_STATE: "NJ",
              PHYS_ZIP: "07302",
              FEIN: ein,
              FAC_ID: "FAC-67890",
              SIC_CODE: "2834",
              NAICS_CODE: "325412",
              DESCRIPTION_1: "Pharmaceutical Preparation Manufacturing",
              BUSINESS_ACTIVITY: "Manufacturing",
              "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)":
                "REGULATED",
              "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)":
                "ACTIVE",
              "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)":
                "CRTK/RPPR",
              "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)":
                "USER",
              RCVD: "01/15/2024",
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValueOnce(businessNameSearchResponse);
      const response = await client.searchByBusinessName(businessName);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/crtk_by_facility_name?facility=${encodeURIComponent(businessName)}`,
      );

      expect(response).toEqual([
        {
          businessName: businessName,
          streetAddress: addressLine1,
          city: "NEWARK",
          state: "NJ",
          zipCode: addressZipCode,
          ein: ein,
          facilityId: "FAC-12345",
          sicCode: "2834",
          naicsCode: "325412",
          description: "Pharmaceutical Preparation Manufacturing",
          businessActivity: "Manufacturing",
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: "01/15/2024",
        },
        {
          businessName: businessName,
          streetAddress: "789 ANOTHER STREET",
          city: "JERSEY CITY",
          state: "NJ",
          zipCode: "07302",
          ein: ein,
          facilityId: "FAC-67890",
          sicCode: "2834",
          naicsCode: "325412",
          description: "Pharmaceutical Preparation Manufacturing",
          businessActivity: "Manufacturing",
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: "01/15/2024",
        },
      ]);
    });

    it("handles null/undefined values in API response for business name search", async () => {
      const businessNameSearchResponse = {
        data: {
          data: [
            {
              FAC_NAME: businessName,
              // eslint-disable-next-line unicorn/no-null
              PHYS_ADDR: null,
              // eslint-disable-next-line unicorn/no-null
              PHYS_CITY: null,
              PHYS_STATE: "NJ",
              PHYS_ZIP: addressZipCode,
              // eslint-disable-next-line unicorn/no-null
              FEIN: null,
              FAC_ID: "FAC-12345",
              // eslint-disable-next-line unicorn/no-null
              SIC_CODE: null,
              // eslint-disable-next-line unicorn/no-null
              NAICS_CODE: null,
              // eslint-disable-next-line unicorn/no-null
              DESCRIPTION_1: null,
              // eslint-disable-next-line unicorn/no-null
              BUSINESS_ACTIVITY: null,
              "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)":
                "REGULATED",
              "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)":
                "ACTIVE",
              "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)":
                "CRTK/RPPR",
              "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)":
                "USER",
              // eslint-disable-next-line unicorn/no-null
              RCVD: null,
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValueOnce(businessNameSearchResponse);
      const response = await client.searchByBusinessName(businessName);

      expect(response).toEqual([
        {
          businessName: businessName,
          streetAddress: undefined,
          city: undefined,
          state: "NJ",
          zipCode: addressZipCode,
          ein: undefined,
          facilityId: "FAC-12345",
          sicCode: undefined,
          naicsCode: undefined,
          description: undefined,
          businessActivity: undefined,
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: undefined,
        },
      ]);
    });

    it("throws a NOT_FOUND error when no entries are found from the business name endpoint", async () => {
      mockAxios.get.mockResolvedValue({ data: { data: [] } });
      await expect(client.searchByBusinessName(businessName)).rejects.toThrow("NOT_FOUND");
    });

    it("throws error when business name endpoint returns an error", async () => {
      mockAxios.get.mockRejectedValue(new Error("NETWORK_ERROR"));
      await expect(client.searchByBusinessName(businessName)).rejects.toThrow("NETWORK_ERROR");
    });
  });

  describe("searchByAddress", () => {
    it("makes a call to the address endpoint and returns an array of CRTK entries", async () => {
      const addressSearchResponse = {
        data: {
          data: [
            {
              FAC_NAME: businessName,
              PHYS_ADDR: addressLine1,
              PHYS_CITY: "NEWARK",
              PHYS_STATE: "NJ",
              PHYS_ZIP: addressZipCode,
              FEIN: ein,
              FAC_ID: "FAC-12345",
              SIC_CODE: "2834",
              NAICS_CODE: "325412",
              DESCRIPTION_1: "Pharmaceutical Preparation Manufacturing",
              BUSINESS_ACTIVITY: "Manufacturing",
              "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)":
                "REGULATED",
              "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)":
                "ACTIVE",
              "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)":
                "CRTK/RPPR",
              "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)":
                "USER",
              RCVD: "01/15/2024",
            },
            {
              FAC_NAME: "ANOTHER FACILITY",
              PHYS_ADDR: addressLine1,
              PHYS_CITY: "NEWARK",
              PHYS_STATE: "NJ",
              PHYS_ZIP: addressZipCode,
              FEIN: "98-7654321",
              FAC_ID: "FAC-99999",
              SIC_CODE: "3714",
              NAICS_CODE: "336399",
              DESCRIPTION_1: "Motor Vehicle Parts Manufacturing",
              BUSINESS_ACTIVITY: "Manufacturing",
              "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)":
                "ADMINISTRATIVEONLY",
              "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)":
                "INACTIVE",
              "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)":
                "EXEMPT",
              "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)":
                "NON-USER",
              RCVD: "03/20/2023",
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValueOnce(addressSearchResponse);
      const response = await client.searchByAddress(addressLine1, addressZipCode);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/crtk_by_address_and_zipcode?address=${encodeURIComponent(
          addressLine1,
        )}&zip=${encodeURIComponent(addressZipCode)}`,
      );

      expect(response).toEqual([
        {
          businessName: businessName,
          streetAddress: addressLine1,
          city: "NEWARK",
          state: "NJ",
          zipCode: addressZipCode,
          ein: ein,
          facilityId: "FAC-12345",
          sicCode: "2834",
          naicsCode: "325412",
          description: "Pharmaceutical Preparation Manufacturing",
          businessActivity: "Manufacturing",
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: "01/15/2024",
        },
        {
          businessName: "ANOTHER FACILITY",
          streetAddress: addressLine1,
          city: "NEWARK",
          state: "NJ",
          zipCode: addressZipCode,
          ein: "98-7654321",
          facilityId: "FAC-99999",
          sicCode: "3714",
          naicsCode: "336399",
          description: "Motor Vehicle Parts Manufacturing",
          businessActivity: "Manufacturing",
          type: "ADMINISTRATIVEONLY",
          status: "INACTIVE",
          eligibility: "EXEMPT",
          userStatus: "NON-USER",
          receivedDate: "03/20/2023",
        },
      ]);
    });

    it("handles null/undefined values in API response for address search", async () => {
      const addressSearchResponse = {
        data: {
          data: [
            {
              FAC_NAME: businessName,
              PHYS_ADDR: addressLine1,
              // eslint-disable-next-line unicorn/no-null
              PHYS_CITY: null,
              // eslint-disable-next-line unicorn/no-null
              PHYS_STATE: null,
              PHYS_ZIP: addressZipCode,
              FEIN: ein,
              // eslint-disable-next-line unicorn/no-null
              FAC_ID: null,
              // eslint-disable-next-line unicorn/no-null
              SIC_CODE: null,
              // eslint-disable-next-line unicorn/no-null
              NAICS_CODE: null,
              // eslint-disable-next-line unicorn/no-null
              DESCRIPTION_1: null,
              // eslint-disable-next-line unicorn/no-null
              BUSINESS_ACTIVITY: null,
              "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)":
                "REGULATED",
              "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)":
                "ACTIVE",
              "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)":
                "CRTK/RPPR",
              "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)":
                "USER",
              RCVD: "01/15/2024",
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValueOnce(addressSearchResponse);
      const response = await client.searchByAddress(addressLine1, addressZipCode);

      expect(response).toEqual([
        {
          businessName: businessName,
          streetAddress: addressLine1,
          city: undefined,
          state: undefined,
          zipCode: addressZipCode,
          ein: ein,
          facilityId: undefined,
          sicCode: undefined,
          naicsCode: undefined,
          description: undefined,
          businessActivity: undefined,
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: "01/15/2024",
        },
      ]);
    });

    it("throws a NOT_FOUND error when no entries are found from the address endpoint", async () => {
      mockAxios.get.mockResolvedValue({ data: { data: [] } });
      await expect(client.searchByAddress(addressLine1, addressZipCode)).rejects.toThrow(
        "NOT_FOUND",
      );
    });

    it("throws error when address endpoint returns an error", async () => {
      mockAxios.get.mockRejectedValue(new Error("SERVER_ERROR"));
      await expect(client.searchByAddress(addressLine1, addressZipCode)).rejects.toThrow(
        "SERVER_ERROR",
      );
    });
  });

  describe("searchByEIN", () => {
    it("makes a call to the EIN endpoint and returns an array of CRTK entries", async () => {
      const einSearchResponse = {
        data: {
          data: [
            {
              FACILITY_NAME: businessName,
              PHYS_ADDR: addressLine1,
              PHYS_CITY: "NEWARK",
              PHYS_STATE: "NJ",
              PHYS_ZIP: addressZipCode,
              FEIN: ein,
              FACILITY_ID: "FAC-12345",
              SIC_CODE: "2834",
              NAICS_CODE: "325412",
              DESCRIPTION_1: "Pharmaceutical Preparation Manufacturing",
              BUSINESS_ACTIVITY: "Manufacturing",
              TYPE: "REGULATED",
              STATUS: "ACTIVE",
              ELGIBILITY: "CRTK/RPPR",
              USER_STATUS: "USER",
              RECEIVED_DATE: "01/15/2024",
            },
            {
              FACILITY_NAME: "SECOND FACILITY",
              PHYS_ADDR: "999 MAIN AVENUE",
              PHYS_CITY: "TRENTON",
              PHYS_STATE: "NJ",
              PHYS_ZIP: "08608",
              FEIN: ein,
              FACILITY_ID: "FAC-54321",
              SIC_CODE: "2834",
              NAICS_CODE: "325412",
              DESCRIPTION_1: "Pharmaceutical Preparation Manufacturing",
              BUSINESS_ACTIVITY: "Manufacturing",
              TYPE: "REGULATED",
              STATUS: "ACTIVE",
              ELGIBILITY: "CRTK/RPPR",
              USER_STATUS: "USERABOVE",
              RECEIVED_DATE: "02/01/2024",
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValueOnce(einSearchResponse);
      const response = await client.searchByEIN(ein);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/crtk_by_fein?fein=${encodeURIComponent(ein)}`,
      );

      expect(response).toEqual([
        {
          businessName: businessName,
          streetAddress: addressLine1,
          city: "NEWARK",
          state: "NJ",
          zipCode: addressZipCode,
          ein: ein,
          facilityId: "FAC-12345",
          sicCode: "2834",
          naicsCode: "325412",
          description: "Pharmaceutical Preparation Manufacturing",
          businessActivity: "Manufacturing",
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: "01/15/2024",
        },
        {
          businessName: "SECOND FACILITY",
          streetAddress: "999 MAIN AVENUE",
          city: "TRENTON",
          state: "NJ",
          zipCode: "08608",
          ein: ein,
          facilityId: "FAC-54321",
          sicCode: "2834",
          naicsCode: "325412",
          description: "Pharmaceutical Preparation Manufacturing",
          businessActivity: "Manufacturing",
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USERABOVE",
          receivedDate: "02/01/2024",
        },
      ]);
    });

    it("handles null/undefined values in API response for EIN search", async () => {
      const einSearchResponse = {
        data: {
          data: [
            {
              FACILITY_NAME: businessName,
              // eslint-disable-next-line unicorn/no-null
              PHYS_ADDR: null,
              // eslint-disable-next-line unicorn/no-null
              PHYS_CITY: null,
              PHYS_STATE: "NJ",
              PHYS_ZIP: addressZipCode,
              FEIN: ein,
              FACILITY_ID: "FAC-12345",
              // eslint-disable-next-line unicorn/no-null
              SIC_CODE: null,
              // eslint-disable-next-line unicorn/no-null
              NAICS_CODE: null,
              // eslint-disable-next-line unicorn/no-null
              DESCRIPTION_1: null,
              // eslint-disable-next-line unicorn/no-null
              BUSINESS_ACTIVITY: null,
              TYPE: "REGULATED",
              STATUS: "ACTIVE",
              ELGIBILITY: "CRTK/RPPR",
              USER_STATUS: "USER",
              // eslint-disable-next-line unicorn/no-null
              RECEIVED_DATE: null,
            },
          ],
        },
      };

      mockAxios.get.mockResolvedValueOnce(einSearchResponse);
      const response = await client.searchByEIN(ein);

      expect(response).toEqual([
        {
          businessName: businessName,
          streetAddress: undefined,
          city: undefined,
          state: "NJ",
          zipCode: addressZipCode,
          ein: ein,
          facilityId: "FAC-12345",
          sicCode: undefined,
          naicsCode: undefined,
          description: undefined,
          businessActivity: undefined,
          type: "REGULATED",
          status: "ACTIVE",
          eligibility: "CRTK/RPPR",
          userStatus: "USER",
          receivedDate: undefined,
        },
      ]);
    });

    it("throws a NOT_FOUND error when no entries are found from the EIN endpoint", async () => {
      mockAxios.get.mockResolvedValue({ data: { data: [] } });
      await expect(client.searchByEIN(ein)).rejects.toThrow("NOT_FOUND");
    });

    it("throws error when EIN endpoint returns an error", async () => {
      mockAxios.get.mockRejectedValue(new Error("DATABASE_ERROR"));
      await expect(client.searchByEIN(ein)).rejects.toThrow("DATABASE_ERROR");
    });
  });

  describe("URL encoding", () => {
    it("properly encodes special characters in business name", async () => {
      const specialBusinessName = "Smith & Jones Co.";
      mockAxios.get.mockResolvedValue({ data: { data: [] } });

      await client.searchByBusinessName(specialBusinessName).catch(() => {});

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/crtk_by_facility_name?facility=${encodeURIComponent(specialBusinessName)}`,
      );
    });

    it("properly encodes special characters in address", async () => {
      const specialAddress = "123 Main St. #Suite 100";
      mockAxios.get.mockResolvedValue({ data: { data: [] } });

      await client.searchByAddress(specialAddress, addressZipCode).catch(() => {});

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/crtk_by_address_and_zipcode?address=${encodeURIComponent(
          specialAddress,
        )}&zip=${encodeURIComponent(addressZipCode)}`,
      );
    });

    it("properly encodes EIN with special characters", async () => {
      const formattedEin = "12-3456789";
      mockAxios.get.mockResolvedValue({ data: { data: [] } });

      await client.searchByEIN(formattedEin).catch(() => {});

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/crtk_by_fein?fein=${encodeURIComponent(formattedEin)}`,
      );
    });
  });
});
