import { XrayRegistrationSearchClient } from "@client/dep/xray/XrayRegistrationSearchClient";
import type { XrayRegistrationSearch } from "@domain/types";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";

import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("xrayRegistrationSearchClient", () => {
  let client: XrayRegistrationSearch;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";
  const businessName = "SOME BUSINESS LLC";
  const addressLine1 = "123 MAIN STREET";
  const addressZipCode = "07652";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = DummyLogWriter;
    client = XrayRegistrationSearchClient(logger, ORG_URL);
  });

  it("makes a call to the business name endpoint and returns an array of xray registration entries", async () => {
    const businessNameSearchResponse = {
      data: {
        data: [
          {
            "Registration Category": "DENTIST",
            // eslint-disable-next-line unicorn/no-null
            "Disposal Date": null,
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            "Room ID": "01",
            REGISTRATION_NUMBER: "330061",
            "CONSOLE_SERIAL#": "770-1676141DP",
            "CONSOLE_MODEL#": "46-404600G",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "JOE",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
          {
            "Registration Category": "DENTIST",
            // eslint-disable-next-line unicorn/no-null
            "Disposal Date": null,
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            "Room ID": "01",
            REGISTRATION_NUMBER: "330061",
            "CONSOLE_SERIAL#": "770-1676141DP",
            "CONSOLE_MODEL#": "46-404600G",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "LEX",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
          {
            "Registration Category": "DENTIST",
            "Disposal Date": "07/31/2019",
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            // eslint-disable-next-line unicorn/no-null
            "Room ID": null,
            REGISTRATION_NUMBER: "330062",
            "CONSOLE_SERIAL#": "62-1664624DP",
            "CONSOLE_MODEL#": "110-0150G1",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "JOE",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
          {
            "Registration Category": "DENTIST",
            "Disposal Date": "07/31/2019",
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            // eslint-disable-next-line unicorn/no-null
            "Room ID": null,
            REGISTRATION_NUMBER: "330062",
            "CONSOLE_SERIAL#": "62-1664624DP",
            "CONSOLE_MODEL#": "110-0150G1",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "LEX",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
        ],
      },
    };

    mockAxios.get.mockResolvedValueOnce(businessNameSearchResponse);
    const response = await client.searchByBusinessName(businessName);

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${encodeURIComponent(ORG_URL)}/xray_by_business_name?namepart=${encodeURIComponent(
        businessName,
      )}`,
    );

    expect(response).toEqual([
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: businessName,
      },
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: businessName,
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: businessName,
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: businessName,
      },
    ]);
  });

  it("makes a call to the address endpoint and returns an array of xray registration entries", async () => {
    const addressSearchReponse = {
      data: {
        data: [
          {
            "Registration Category": "DENTIST",
            // eslint-disable-next-line unicorn/no-null
            "Disposal Date": null,
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            "Room ID": "01",
            REGISTRATION_NUMBER: "330061",
            "CONSOLE_SERIAL#": "770-1676141DP",
            "CONSOLE_MODEL#": "46-404600G",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "JOE",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
          {
            "Registration Category": "DENTIST",
            // eslint-disable-next-line unicorn/no-null
            "Disposal Date": null,
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            "Room ID": "01",
            REGISTRATION_NUMBER: "330061",
            "CONSOLE_SERIAL#": "770-1676141DP",
            "CONSOLE_MODEL#": "46-404600G",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "LEX",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
          {
            "Registration Category": "DENTIST",
            "Disposal Date": "07/31/2019",
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            // eslint-disable-next-line unicorn/no-null
            "Room ID": null,
            REGISTRATION_NUMBER: "330062",
            "CONSOLE_SERIAL#": "62-1664624DP",
            "CONSOLE_MODEL#": "110-0150G1",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "JOE",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
          {
            "Registration Category": "DENTIST",
            "Disposal Date": "07/31/2019",
            "Registration Expiration Date": "08/31/2025",
            NAME: "GENDEX CORP.",
            // eslint-disable-next-line unicorn/no-null
            "Room ID": null,
            REGISTRATION_NUMBER: "330062",
            "CONSOLE_SERIAL#": "62-1664624DP",
            "CONSOLE_MODEL#": "110-0150G1",
            "Street Address": addressLine1,
            CITY: "PARAMUS",
            STATE: "NJ",
            "Zip Code": addressZipCode,
            Status: "Active",
            BUSINESS_NAME: businessName,
            FIRST_NAME: "LEX",
            LAST_NAME: "NEEL",
            "Contact Type": "OWNER",
            // eslint-disable-next-line unicorn/no-null
            "Deactivation Date": null,
            ANNUAL_FEE: 92,
          },
        ],
      },
    };

    mockAxios.get.mockResolvedValueOnce(addressSearchReponse);
    const response = await client.searchByAddress(addressLine1, addressZipCode);

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/xray_by_address?partialaddr=${encodeURIComponent(
        addressLine1,
      )}&zip=${encodeURIComponent(addressZipCode)}`,
    );

    expect(response).toEqual([
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: businessName,
      },
      {
        registrationNumber: "330061",
        roomId: "01",
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "46-404600G",
        serialNumber: "770-1676141DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: undefined,
        businessName: businessName,
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: businessName,
      },
      {
        registrationNumber: "330062",
        roomId: undefined,
        registrationCategory: "DENTIST",
        name: "GENDEX CORP.",

        modelNumber: "110-0150G1",
        serialNumber: "62-1664624DP",
        annualFee: 92,
        expirationDate: "08/31/2025",
        deactivationDate: undefined,
        streetAddress: addressLine1,
        city: "PARAMUS",
        state: "NJ",
        zipCode: addressZipCode,
        status: "Active",
        contactType: "OWNER",
        disposalDate: "07/31/2019",
        businessName: businessName,
      },
    ]);
  });

  it("throws a NOT_FOUND error when no entries are found from the business name endpoint", async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [] } });
    await expect(client.searchByBusinessName(businessName)).rejects.toThrow("NOT_FOUND");
  });

  it("throws a NOT_FOUND error when no entries are found from the address endpoint", async () => {
    mockAxios.get.mockResolvedValue({ data: { data: [] } });
    await expect(client.searchByAddress(addressLine1, addressZipCode)).rejects.toThrow("NOT_FOUND");
  });
});
