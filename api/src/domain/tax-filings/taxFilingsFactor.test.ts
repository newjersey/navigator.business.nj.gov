import { randomInt } from "@shared/intHelpers";
import { UserData } from "@shared/UserData";
import {
  generateTaxFiling,
  generateTaxFilingData,
  generateTaxIdAndBusinessName,
  generateUserData,
} from "../../../test/factories";
import {
  ApiTaxFilingClient,
  TaxFilingClient,
  TaxFilingLookupResponse,
  TaxFilingOnboardingResponse,
  UserDataClient,
} from "../types";
import { taxFilingsFactory } from "./taxFilingsFactory";

describe("TaxFilingsFactory", () => {
  let taxFilingClient: TaxFilingClient;
  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let apiTaxFilingClient: jest.Mocked<ApiTaxFilingClient>;
  const userIdTaxIdBusinessName = { userId: randomInt(4).toString(), ...generateTaxIdAndBusinessName({}) };

  beforeEach(async () => {
    jest.resetAllMocks();
    apiTaxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    taxFilingClient = taxFilingsFactory(stubUserDataClient, apiTaxFilingClient);
  });

  describe("lookup", () => {
    describe("updates only state field when", () => {
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          filings: [generateTaxFiling({})],
        }),
      });

      it("FAILED state", async () => {
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "FAILED",
          filings: [],
        } as TaxFilingLookupResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.lookup(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "FAILED" },
        });
      });

      it("PENDING state", async () => {
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "PENDING",
          filings: [],
        } as TaxFilingLookupResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.lookup(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "PENDING" },
        });
      });

      it("API_ERROR state", async () => {
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "API_ERROR",
          filings: [],
        } as TaxFilingLookupResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.lookup(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "API_ERROR" },
        });
      });
    });

    it("updates state and filing data on successful lookup", async () => {
      const filingData = generateTaxFiling({});
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          filings: [generateTaxFiling({})],
        }),
      });
      apiTaxFilingClient.lookup.mockResolvedValue({
        state: "SUCCESS",
        filings: [filingData],
      } as TaxFilingLookupResponse);
      stubUserDataClient.get.mockResolvedValue(userData);
      expect(await taxFilingClient.lookup(userIdTaxIdBusinessName)).toEqual({
        ...userData,
        taxFilingData: { ...userData.taxFilingData, state: "SUCCESS", filings: [filingData] },
      });
    });
  });

  describe("onboarding", () => {
    describe("returns lookup data", () => {
      let userData: UserData;

      beforeEach(() => {
        userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            filings: [generateTaxFiling({})],
          }),
        });
      });

      it("when lookup response is API_ERROR", async () => {
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "API_ERROR",
          filings: [],
        } as TaxFilingLookupResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "API_ERROR" },
        });
        expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
      });

      it("when lookup response is pending", async () => {
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "PENDING",
          filings: [],
        } as TaxFilingLookupResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "PENDING" },
        });
        expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
      });

      it("when lookup response is success", async () => {
        const filingData = generateTaxFiling({});
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [filingData],
        } as TaxFilingLookupResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "SUCCESS", filings: [filingData] },
        });
        expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
      });
    });

    it("checks the onboarding api when lookup failed", async () => {
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          filings: [generateTaxFiling({})],
        }),
      });
      apiTaxFilingClient.lookup.mockResolvedValue({
        state: "FAILED",
        filings: [],
      } as TaxFilingLookupResponse);
      apiTaxFilingClient.onboarding.mockResolvedValue({ state: "SUCCESS" } as TaxFilingOnboardingResponse);
      stubUserDataClient.get.mockResolvedValue(userData);
      expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
        ...userData,
        taxFilingData: { ...userData.taxFilingData, state: "PENDING" },
      });
    });

    describe("returns onboarding data when lookup failed", () => {
      it("returns pending when onboarding is successful", async () => {
        const userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            filings: [generateTaxFiling({})],
          }),
        });
        apiTaxFilingClient.lookup.mockResolvedValue({
          state: "FAILED",
          filings: [],
        } as TaxFilingLookupResponse);
        apiTaxFilingClient.onboarding.mockResolvedValue({ state: "SUCCESS" } as TaxFilingOnboardingResponse);
        stubUserDataClient.get.mockResolvedValue(userData);
        expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
          ...userData,
          taxFilingData: { ...userData.taxFilingData, state: "PENDING" },
        });
      });

      describe("returns onboarding state when", () => {
        it("responds with api error", async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              filings: [generateTaxFiling({})],
            }),
          });
          apiTaxFilingClient.lookup.mockResolvedValue({
            state: "FAILED",
            filings: [],
          } as TaxFilingLookupResponse);
          apiTaxFilingClient.onboarding.mockResolvedValue({
            state: "API_ERROR",
          } as TaxFilingOnboardingResponse);
          stubUserDataClient.get.mockResolvedValue(userData);
          expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
            ...userData,
            taxFilingData: { ...userData.taxFilingData, state: "API_ERROR" },
          });
        });

        it("responds with failed", async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              filings: [generateTaxFiling({})],
            }),
          });
          apiTaxFilingClient.lookup.mockResolvedValue({
            state: "FAILED",
            filings: [],
          } as TaxFilingLookupResponse);
          apiTaxFilingClient.onboarding.mockResolvedValue({ state: "FAILED" } as TaxFilingOnboardingResponse);
          stubUserDataClient.get.mockResolvedValue(userData);
          expect(await taxFilingClient.onboarding(userIdTaxIdBusinessName)).toEqual({
            ...userData,
            taxFilingData: { ...userData.taxFilingData, state: "FAILED" },
          });
        });
      });
    });
  });
});
