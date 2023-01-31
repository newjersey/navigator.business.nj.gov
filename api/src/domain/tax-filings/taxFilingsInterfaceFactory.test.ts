import { TaxFilingState } from "@shared/taxFiling";
import { UserData } from "@shared/userData";
import {
  generatePreferences,
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
    describe("when successful", () => {
      it("updates state and filing data", async () => {
        const filingData = generateTaxFiling({});
        const userData = generateUserData({
          preferences: generatePreferences({
            isCalendarFullView: true,
          }),
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
          preferences: {
            ...userData.preferences,
            isCalendarFullView: true,
          },
          taxFilingData: {
            ...userData.taxFilingData,
            state: "SUCCESS",
            businessName: taxIdBusinessName.businessName,
            filings: [filingData],
            lastUpdatedISO: currentDate.toISOString(),
          },
        });
      });

      it("sets isCalendarFullView preference to true if filings length was 5 or fewer and is now more than 5", async () => {
        const userData = setupInitialUserDataWithCal({ numFilings: 5, isCalendarFullView: false });
        mockTaxFilingLookup({ numFilings: 6, state: "SUCCESS" });
        const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
        expect(resultingUserData.preferences.isCalendarFullView).toEqual(true);
      });

      describe("keeps previous value of isCalendarFullView", () => {
        const prevIsCalendarFullView: boolean[] = [true, false];

        for (const prevCalendarView of prevIsCalendarFullView) {
          it(`${prevCalendarView} when filings length was more than 5 and remains more than 5`, async () => {
            const userData = setupInitialUserDataWithCal({
              numFilings: 6,
              isCalendarFullView: prevCalendarView,
            });
            mockTaxFilingLookup({ numFilings: 6, state: "SUCCESS" });
            const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
            expect(resultingUserData.preferences.isCalendarFullView).toEqual(prevCalendarView);
          });

          it(`${prevCalendarView} when filings length was 5 or fewer and remains fewer than 5`, async () => {
            const userData = setupInitialUserDataWithCal({
              numFilings: 5,
              isCalendarFullView: prevCalendarView,
            });
            mockTaxFilingLookup({ numFilings: 5, state: "SUCCESS" });
            const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
            expect(resultingUserData.preferences.isCalendarFullView).toEqual(prevCalendarView);
          });
        }
      });
    });

    describe("when anything but successful", () => {
      const nonSuccessStates: TaxFilingState[] = ["FAILED", "UNREGISTERED", "PENDING", "API_ERROR"];

      for (const state of nonSuccessStates) {
        it(`returns a ${state} state without updating filing data`, async () => {
          const userData = generateUserData({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              filings: [generateTaxFiling({})],
            }),
          });

          taxFilingClient.lookup.mockResolvedValue({
            state: state,
            filings: [],
          });

          expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual({
            ...userData,
            taxFilingData: {
              ...userData.taxFilingData,
              state: state,
              businessName: taxIdBusinessName.businessName,
              lastUpdatedISO: currentDate.toISOString(),
            },
          });
        });

        it(`keeps false value of isCalendarFullView when state is ${state}`, async () => {
          const userData = setupInitialUserDataWithCal({ numFilings: 0, isCalendarFullView: false });
          mockTaxFilingLookup({ numFilings: 0, state });
          const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
          expect(resultingUserData.preferences.isCalendarFullView).toEqual(false);
        });

        it(`keeps true value of isCalendarFullView when state is ${state}`, async () => {
          const userData = setupInitialUserDataWithCal({ numFilings: 0, isCalendarFullView: true });
          mockTaxFilingLookup({ numFilings: 0, state });
          const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
          expect(resultingUserData.preferences.isCalendarFullView).toEqual(true);
        });
      }
    });

    /* eslint-disable unicorn/consistent-function-scoping */
    function setupInitialUserDataWithCal(params: {
      isCalendarFullView: boolean;
      numFilings: number;
    }): UserData {
      return generateUserData({
        preferences: generatePreferences({
          isCalendarFullView: params.isCalendarFullView,
        }),
        taxFilingData: generateTaxFilingData({
          filings: Array(params.numFilings).fill(generateTaxFiling({})),
        }),
      });
    }

    /* eslint-disable unicorn/consistent-function-scoping */
    function mockTaxFilingLookup(params: { state: TaxFilingState; numFilings: number }): void {
      taxFilingClient.lookup.mockResolvedValue({
        state: params.state,
        filings: Array(params.numFilings).fill(generateTaxFiling({})),
      });
    }
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
