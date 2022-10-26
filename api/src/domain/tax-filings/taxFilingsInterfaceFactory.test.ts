import { UserData } from "@shared/userData";
import {
  generateTaxFiling,
  generateTaxFilingData,
  generateTaxIdAndBusinessName,
  generateUserData,
} from "../../../test/factories";
import {
  TaxFilingClient,
  TaxFilingInterface,
  TaxFilingLookupResponse,
  TaxFilingOnboardingResponse,
} from "../types";
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
    const dateNowStub = jest.fn(() => dateNow);
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
        } as TaxFilingLookupResponse);
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
        } as TaxFilingLookupResponse);
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
        } as TaxFilingLookupResponse);
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
      } as TaxFilingLookupResponse);
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
    describe("only does a lookup", () => {
      let userData: UserData;

      beforeEach(() => {
        userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdatedISO: undefined,
            filings: [generateTaxFiling({})],
          }),
        });
      });

      it("returns lookup response when lookup returns API_ERROR", async () => {
        taxFilingClient.lookup.mockResolvedValue({
          state: "API_ERROR",
          filings: [],
        } as TaxFilingLookupResponse);
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "API_ERROR",
            registered: false,
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
        expect(taxFilingClient.onboarding).not.toHaveBeenCalled();
      });

      it("returns lookup response when lookup returns FAILED", async () => {
        taxFilingClient.lookup.mockResolvedValue({
          state: "FAILED",
          filings: [],
        } as TaxFilingLookupResponse);
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "FAILED",
            registered: false,
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
        expect(taxFilingClient.onboarding).not.toHaveBeenCalled();
      });

      it("returns lookup response when lookup returns PENDING", async () => {
        taxFilingClient.lookup.mockResolvedValue({
          state: "PENDING",
          filings: [],
        } as TaxFilingLookupResponse);
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            registered: true,
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
        expect(taxFilingClient.onboarding).not.toHaveBeenCalled();
      });

      it("returns lookup response when lookup returns SUCCESS", async () => {
        const filingData = generateTaxFiling({});
        taxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [filingData],
        } as TaxFilingLookupResponse);
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "SUCCESS",
            businessName: taxIdBusinessName.businessName,
            registered: true,
            filings: [filingData],
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
        expect(taxFilingClient.onboarding).not.toHaveBeenCalled();
      });
    });

    describe("returns onboarding data when lookup returns UNREGISTERED", () => {
      it("returns pending when onboarding is successful", async () => {
        const userData = generateUserData({
          taxFilingData: generateTaxFilingData({
            state: undefined,
            lastUpdatedISO: undefined,
            filings: [generateTaxFiling({})],
          }),
        });
        taxFilingClient.lookup.mockResolvedValue({
          state: "UNREGISTERED",
          filings: [],
        } as TaxFilingLookupResponse);
        taxFilingClient.onboarding.mockResolvedValue({ state: "SUCCESS" } as TaxFilingOnboardingResponse);
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
          ...userData,
          taxFilingData: {
            ...userData.taxFilingData,
            state: "PENDING",
            registered: true,
            businessName: taxIdBusinessName.businessName,
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
      });

      describe("returns onboarding response", () => {
        it("passes through the API_ERROR response", async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              filings: [generateTaxFiling({})],
            }),
          });
          taxFilingClient.lookup.mockResolvedValue({
            state: "UNREGISTERED",
            filings: [],
          } as TaxFilingLookupResponse);
          taxFilingClient.onboarding.mockResolvedValue({
            state: "API_ERROR",
          } as TaxFilingOnboardingResponse);
          expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
            ...userData,
            taxFilingData: {
              ...userData.taxFilingData,
              state: "API_ERROR",
              registered: false,
              businessName: taxIdBusinessName.businessName,
              lastUpdatedISO: currentDate.toISOString(),
            },
          });
        });

        it("passes through the FAILED response", async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              filings: [generateTaxFiling({})],
            }),
          });
          taxFilingClient.lookup.mockResolvedValue({
            state: "UNREGISTERED",
            filings: [],
          } as TaxFilingLookupResponse);
          taxFilingClient.onboarding.mockResolvedValue({
            state: "FAILED",
            errorField: "Business Name",
          } as TaxFilingOnboardingResponse);
          expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual({
            ...userData,
            taxFilingData: {
              ...userData.taxFilingData,
              state: "FAILED",
              registered: false,
              errorField: "Business Name",
              businessName: taxIdBusinessName.businessName,
              lastUpdatedISO: currentDate.toISOString(),
            },
          });
        });
      });
    });
  });
});
