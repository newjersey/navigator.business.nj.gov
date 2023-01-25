import { UserData } from "@shared/userData";
import {
  generateTaxFiling,
  generateTaxFilingData,
  generateTaxIdAndBusinessName,
  generateUserData,
} from "../../../test/factories";
import { TaxFilingClient, TaxFilingInterface } from "../types";
import { taxFilingsInterfaceFactory } from "./taxFilingsInterfaceFactory";

describe("TaxFilingsInterfaceFactory", () => {
  let taxFilingInterface: TaxFilingInterface;
  let taxFilingClient: jest.Mocked<TaxFilingClient>;

  const taxIdBusinessName = generateTaxIdAndBusinessName({});
  const dateNow = Date.now();
  const currentDate = new Date(dateNow);
  const realDateNow = Date.now.bind(global.Date);

  beforeEach(async () => {
    jest.resetAllMocks();
    taxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };
    const dateNowStub = jest.fn(() => {
      return dateNow;
    });
    global.Date.now = dateNowStub;

    taxFilingInterface = taxFilingsInterfaceFactory(taxFilingClient);
  });

  afterEach(() => {
    global.Date.now = realDateNow;
  });

  describe("lookup", () => {
    describe("when not successful", () => {
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          lastUpdatedISO: undefined,
          filings: [generateTaxFiling({})],
        }),
      });

      it("returns a FAILED state without updating filing data", async () => {
        taxFilingClient.lookup.mockResolvedValue({
          state: "FAILED",
          filings: [],
        });
        expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "FAILED",
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
      });

      it("returns a PENDING state without updating filing data", async () => {
        taxFilingClient.lookup.mockResolvedValue({
          state: "PENDING",
          filings: [],
        });
        expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
      });

      it("returns a API_ERROR state without updating filing data", async () => {
        taxFilingClient.lookup.mockResolvedValue({
          state: "API_ERROR",
          filings: [],
        });
        expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "API_ERROR",
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
      });
    });

    it("updates state and filing data when successful", async () => {
      const filingData = generateTaxFiling({});
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          lastUpdatedISO: undefined,
          filings: [generateTaxFiling({})],
        }),
      });
      taxFilingClient.lookup.mockResolvedValue({
        state: "SUCCESS",
        filings: [filingData],
      });
      expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual({
        ...userData,
        taxFilingData: {
          ...userData.taxFilingData,
          state: "SUCCESS",
          businessName: taxIdBusinessName.businessName,
          filings: [filingData],
          lastUpdatedISO: currentDate.toISOString(),
        },
      });
    });
  });

  describe("onboarding", () => {
    describe("only does a lookup when onboarding is successful", () => {
      let userData: UserData;

      beforeEach(() => {
        userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdatedISO: undefined,
            registeredISO: undefined,
            filings: [generateTaxFiling({})],
          }),
        });
      });

      it("returns lookup response when onboarding returns SUCCESS", async () => {
        const filingData = generateTaxFiling({});
        taxFilingClient.onboarding.mockResolvedValue({
          state: "SUCCESS",
        });
        taxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [filingData],
        });
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "SUCCESS",
            businessName: taxIdBusinessName.businessName,
            filings: [filingData],
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
      });
    });

    describe("returns onboarding response", () => {
      it("returns the API_ERROR response", async () => {
        const userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdatedISO: undefined,
            registeredISO: undefined,
          }),
        });
        taxFilingClient.onboarding.mockResolvedValue({
          state: "API_ERROR",
        });
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "API_ERROR",
            registeredISO: undefined,
            businessName: taxIdBusinessName.businessName,
          },
        });
      });

      it("returns the FAILED response", async () => {
        const userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdatedISO: undefined,
            registeredISO: undefined,
          }),
        });
        taxFilingClient.onboarding.mockResolvedValue({
          state: "FAILED",
          errorField: "businessName",
        });
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "FAILED",
            registeredISO: undefined,
            errorField: "businessName",
            businessName: taxIdBusinessName.businessName,
          },
        });
      });

      it("returns the PENDING response", async () => {
        const userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdatedISO: undefined,
            registeredISO: undefined,
          }),
        });
        taxFilingClient.onboarding.mockResolvedValue({
          state: "PENDING",
          errorField: "businessName",
        });
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            registeredISO: currentDate.toISOString(),
            lastUpdatedISO: currentDate.toISOString(),
            errorField: "businessName",
            businessName: taxIdBusinessName.businessName,
          },
        });
      });
    });
  });
});
