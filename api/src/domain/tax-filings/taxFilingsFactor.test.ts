import { randomInt } from "@shared/intHelpers";
import { UserData } from "@shared/userData";
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
  const dateNow = Date.now();
  const currentDate = new Date(dateNow);
  const realDateNow = Date.now.bind(global.Date);

  beforeEach(async () => {
    jest.resetAllMocks();
    apiTaxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };
    const dateNowStub = jest.fn(() => dateNow);
    global.Date.now = dateNowStub;
    stubUserDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    taxFilingClient = taxFilingsFactory(stubUserDataClient, apiTaxFilingClient);
  });

  afterEach(() => {
    global.Date.now = realDateNow;
  });

  describe("lookup", () => {
    describe("updates only state field when", () => {
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          lastUpdated: undefined,
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "FAILED",
            businessName: userIdTaxIdBusinessName.businessName,
            lastUpdated: currentDate.toISOString(),
          },
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            businessName: userIdTaxIdBusinessName.businessName,
            lastUpdated: currentDate.toISOString(),
          },
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "API_ERROR",
            businessName: userIdTaxIdBusinessName.businessName,
            lastUpdated: currentDate.toISOString(),
          },
        });
      });
    });

    it("updates state and filing data on successful lookup", async () => {
      const filingData = generateTaxFiling({});
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          lastUpdated: undefined,
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
        taxFilingData: {
          ...userData.taxFilingData,
          state: "SUCCESS",
          businessName: userIdTaxIdBusinessName.businessName,
          filings: [filingData],
          lastUpdated: currentDate.toISOString(),
        },
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
            lastUpdated: undefined,
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "API_ERROR",
            businessName: userIdTaxIdBusinessName.businessName,
            lastUpdated: currentDate.toISOString(),
          },
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            businessName: userIdTaxIdBusinessName.businessName,
            lastUpdated: currentDate.toISOString(),
          },
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "SUCCESS",
            businessName: userIdTaxIdBusinessName.businessName,
            filings: [filingData],
            lastUpdated: currentDate.toISOString(),
          },
        });
        expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
      });
    });

    it("checks the onboarding api when lookup failed", async () => {
      const userData = generateUserData({
        taxFilingData: generateTaxFilingData({
          state: undefined,
          lastUpdated: undefined,
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
        taxFilingData: {
          ...userData.taxFilingData,
          state: "PENDING",
          businessName: userIdTaxIdBusinessName.businessName,
          lastUpdated: currentDate.toISOString(),
        },
      });
    });

    describe("returns onboarding data when lookup failed", () => {
      it("returns pending when onboarding is successful", async () => {
        const userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdated: undefined,
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
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            businessName: userIdTaxIdBusinessName.businessName,
            lastUpdated: currentDate.toISOString(),
          },
        });
      });

      describe("returns onboarding state when", () => {
        it("responds with api error", async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdated: undefined,
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
            taxFilingData: {
              ...userData.taxFilingData,
              state: "API_ERROR",
              businessName: userIdTaxIdBusinessName.businessName,
              lastUpdated: currentDate.toISOString(),
            },
          });
        });

        it("responds with failed", async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdated: undefined,
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
            taxFilingData: {
              ...userData.taxFilingData,
              state: "FAILED",
              businessName: userIdTaxIdBusinessName.businessName,
              lastUpdated: currentDate.toISOString(),
            },
          });
        });
      });
    });
  });
});
