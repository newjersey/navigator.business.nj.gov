import { taxFilingsInterfaceFactory } from "@domain/tax-filings/taxFilingsInterfaceFactory";
import { TaxFilingClient, TaxFilingInterface } from "@domain/types";
import * as fetchMunicipality from "@domain/user/fetchMunicipalityByName";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { TaxFilingCalendarEvent, TaxFilingLookupState, TaxFilingState } from "@shared/taxFiling";
import {
  generateBusiness,
  generateMunicipalityDetail,
  generatePreferences,
  generateProfileData,
  generateTaxFilingCalendarEvent,
  generateTaxFilingData,
  generateTaxIdAndBusinessName,
  generateUserDataForBusiness,
} from "@shared/test";
import { Business, UserData } from "@shared/userData";

jest.mock("@domain/user/fetchMunicipalityByName", () => ({
  fetchMunicipalityByName: jest.fn(),
}));

const mockFetchMunicipalityByName = (fetchMunicipality as jest.Mocked<typeof fetchMunicipality>)
  .fetchMunicipalityByName;

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
        const filingData = generateTaxFilingCalendarEvent({});
        const userData = generateUserDataForBusiness(
          generateBusiness({
            preferences: generatePreferences({
              isCalendarFullView: true,
            }),
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              filings: [generateTaxFilingCalendarEvent({})],
            }),
          })
        );
        taxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [filingData],
          naicsCode: "123456",
          taxCity: "testville",
        });
        mockFetchMunicipalityByName.mockResolvedValue(
          generateMunicipalityDetail({
            id: "testville-id",
            townName: "testville",
            townDisplayName: "Testville",
            countyName: "testCounty",
          })
        );
        const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          profileData: {
            ...business.profileData,
            naicsCode: "123456",
            municipality: {
              county: "testCounty",
              displayName: "Testville",
              id: "testville-id",
              name: "testville",
            },
          },
          preferences: {
            ...business.preferences,
            isCalendarFullView: true,
          },
          taxFilingData: {
            ...business.taxFilingData,
            state: "SUCCESS",
            businessName: taxIdBusinessName.businessName,
            filings: [filingData],
            lastUpdatedISO: currentDate.toISOString(),
            registeredISO: currentDate.toISOString(),
          },
        }));
        expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual(expectedUserData);
      });

      it("removes errors if lookup succeeds", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            taxFilingData: generateTaxFilingData({
              errorField: "formFailure",
            }),
          })
        );
        taxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [],
        });

        const response = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
        expect(getCurrentBusiness(response).taxFilingData.errorField).toEqual(undefined);
      });

      it("sets registeredISO if it is undefined", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            taxFilingData: generateTaxFilingData({
              registeredISO: undefined,
            }),
          })
        );
        taxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [],
        });

        const response = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
        expect(getCurrentBusiness(response).taxFilingData.registeredISO).toEqual(currentDate.toISOString());
      });

      it("keeps existing registeredISO if it is defined", async () => {
        const registeredISO = new Date("2023-01-01").toISOString();
        const userData = generateUserDataForBusiness(
          generateBusiness({
            taxFilingData: generateTaxFilingData({ registeredISO }),
          })
        );
        taxFilingClient.lookup.mockResolvedValue({
          state: "SUCCESS",
          filings: [],
        });

        const response = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
        expect(getCurrentBusiness(response).taxFilingData.registeredISO).toEqual(registeredISO);
      });

      it("sets isCalendarFullView preference to true if filings in current year was 5 or fewer and is now more than 5", async () => {
        const userData = setupInitialUserDataWithCal({
          numFilingsInCurrentYear: 5,
          isCalendarFullView: false,
        });
        mockTaxFilingLookup({ numFilingsInCurrentYear: 6, state: "SUCCESS" });
        const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
        expect(getCurrentBusiness(resultingUserData).preferences.isCalendarFullView).toEqual(true);
      });

      describe("keeps previous value of isCalendarFullView", () => {
        const prevIsCalendarFullView: boolean[] = [true, false];

        for (const prevCalendarView of prevIsCalendarFullView) {
          it(`${prevCalendarView} when filings in current year was more than 5 and remains more than 5`, async () => {
            const userData = setupInitialUserDataWithCal({
              numFilingsInCurrentYear: 6,
              isCalendarFullView: prevCalendarView,
            });
            mockTaxFilingLookup({ numFilingsInCurrentYear: 6, state: "SUCCESS" });
            const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
            expect(getCurrentBusiness(resultingUserData).preferences.isCalendarFullView).toEqual(
              prevCalendarView
            );
          });

          it(`${prevCalendarView} when filings length in current year 5 or fewer and remains fewer than 5`, async () => {
            const userData = setupInitialUserDataWithCal({
              numFilingsInCurrentYear: 5,
              isCalendarFullView: prevCalendarView,
            });
            mockTaxFilingLookup({ numFilingsInCurrentYear: 5, state: "SUCCESS" });
            const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
            expect(getCurrentBusiness(resultingUserData).preferences.isCalendarFullView).toEqual(
              prevCalendarView
            );
          });

          it(`${prevCalendarView} when filings are more than 5 but not this year`, async () => {
            const userData = setupInitialUserDataWithCal({
              numFilingsInCurrentYear: 0,
              isCalendarFullView: prevCalendarView,
            });
            taxFilingClient.lookup.mockResolvedValue({
              state: "SUCCESS",
              filings: createFilings({ numFilingsInCurrentYear: 0, numFilingsInNextYear: 6 }),
            });
            const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
            expect(getCurrentBusiness(resultingUserData).preferences.isCalendarFullView).toEqual(
              prevCalendarView
            );
          });
        }
      });
    });

    describe("when anything but successful", () => {
      const nonSuccessStates: TaxFilingState[] = ["FAILED", "UNREGISTERED", "PENDING", "API_ERROR"];

      for (const state of nonSuccessStates) {
        it(`returns a ${state} state without updating filing data`, async () => {
          const userData = generateUserDataForBusiness(
            generateBusiness({
              profileData: generateProfileData({
                naicsCode: undefined,
                municipality: undefined,
              }),
              taxFilingData: generateTaxFilingData({
                state: undefined,
                lastUpdatedISO: undefined,
                filings: [generateTaxFilingCalendarEvent({})],
              }),
            })
          );

          taxFilingClient.lookup.mockResolvedValue({
            state: state,
            filings: [],
            naicsCode: undefined,
            taxCity: undefined,
          });

          const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
            ...business,
            taxFilingData: {
              ...business.taxFilingData,
              state: state,
              businessName: taxIdBusinessName.businessName,
              lastUpdatedISO: currentDate.toISOString(),
            },
          }));

          expect(await taxFilingInterface.lookup({ userData, ...taxIdBusinessName })).toEqual(
            expectedUserData
          );
        });

        it(`keeps false value of isCalendarFullView when state is ${state}`, async () => {
          const userData = setupInitialUserDataWithCal({
            numFilingsInCurrentYear: 0,
            isCalendarFullView: false,
          });
          mockTaxFilingLookup({ numFilingsInCurrentYear: 0, state });
          const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
          expect(getCurrentBusiness(resultingUserData).preferences.isCalendarFullView).toEqual(false);
        });

        it(`keeps true value of isCalendarFullView when state is ${state}`, async () => {
          const userData = setupInitialUserDataWithCal({
            numFilingsInCurrentYear: 0,
            isCalendarFullView: true,
          });
          mockTaxFilingLookup({ numFilingsInCurrentYear: 0, state });
          const resultingUserData = await taxFilingInterface.lookup({ userData, ...taxIdBusinessName });
          expect(getCurrentBusiness(resultingUserData).preferences.isCalendarFullView).toEqual(true);
        });
      }
    });

    /* eslint-disable unicorn/consistent-function-scoping */
    function setupInitialUserDataWithCal(params: {
      isCalendarFullView: boolean;
      numFilingsInCurrentYear: number;
    }): UserData {
      return generateUserDataForBusiness(
        generateBusiness({
          preferences: generatePreferences({
            isCalendarFullView: params.isCalendarFullView,
          }),
          taxFilingData: generateTaxFilingData({
            filings: createFilings(params),
          }),
        })
      );
    }

    /* eslint-disable unicorn/consistent-function-scoping */
    function mockTaxFilingLookup(params: { state: TaxFilingState; numFilingsInCurrentYear: number }): void {
      taxFilingClient.lookup.mockResolvedValue({
        state: params.state,
        filings: createFilings(params),
      });
    }

    /* eslint-disable unicorn/consistent-function-scoping */
    function createFilings(params: {
      numFilingsInCurrentYear: number;
      numFilingsInNextYear?: number;
    }): TaxFilingCalendarEvent[] {
      const thisYear = currentDate.getFullYear();
      const nextYear = currentDate.getFullYear() + 1;
      const filingsInCurrentYear = Array(params.numFilingsInCurrentYear).fill(
        generateTaxFilingCalendarEvent({ dueDate: `${thisYear}-12-31` })
      );
      const filingsInNextYear = Array(params.numFilingsInNextYear ?? 5).fill(
        generateTaxFilingCalendarEvent({ dueDate: `${nextYear}-12-31` })
      );
      return [...filingsInCurrentYear, ...filingsInNextYear];
    }
  });

  describe("onboarding", () => {
    describe("only does a lookup when onboarding is successful and returns its response", () => {
      let userData: UserData;
      let currentBusiness: Business;

      beforeEach(() => {
        userData = generateUserDataForBusiness(
          generateBusiness({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              registeredISO: undefined,
              filings: [generateTaxFilingCalendarEvent({})],
            }),
          })
        );
        currentBusiness = getCurrentBusiness(userData);
      });

      describe("when successful", () => {
        it("reflects the SUCCESS lookup response", async () => {
          const filingData = generateTaxFilingCalendarEvent({});
          taxFilingClient.onboarding.mockResolvedValue({
            state: "SUCCESS",
          });
          taxFilingClient.lookup.mockResolvedValue({
            state: "SUCCESS",
            filings: [filingData],
            naicsCode: "123456",
            taxCity: "testville",
          });
          mockFetchMunicipalityByName.mockResolvedValue(
            generateMunicipalityDetail({
              id: "testville-id",
              townName: "testville",
              townDisplayName: "Testville",
              countyName: "testCounty",
            })
          );

          const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
            ...business,
            profileData: {
              ...business.profileData,
              municipality: {
                county: "testCounty",
                displayName: "Testville",
                id: "testville-id",
                name: "testville",
              },
              naicsCode: "123456",
            },
            taxFilingData: {
              ...business.taxFilingData,
              state: "SUCCESS",
              businessName: taxIdBusinessName.businessName,
              filings: [filingData],
              lastUpdatedISO: currentDate.toISOString(),
              registeredISO: currentDate.toISOString(),
            },
          }));

          expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual(
            expectedUserData
          );
        });
      });

      describe("when anything but successful", () => {
        const nonSuccessStates: TaxFilingLookupState[] = ["FAILED", "UNREGISTERED", "PENDING", "API_ERROR"];

        for (const state of nonSuccessStates) {
          it(`reflects the ${state} lookup response`, async () => {
            taxFilingClient.onboarding.mockResolvedValue({
              state: "SUCCESS",
            });
            taxFilingClient.lookup.mockResolvedValue({
              state: state,
              filings: currentBusiness.taxFilingData.filings,
            });

            const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
              ...business,
              taxFilingData: {
                ...business.taxFilingData,
                state: state,
                businessName: taxIdBusinessName.businessName,
                lastUpdatedISO: currentDate.toISOString(),
              },
            }));
            expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual(
              expectedUserData
            );
          });
        }
      });
    });

    describe("returns onboarding response", () => {
      it("returns the API_ERROR response", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              registeredISO: undefined,
            }),
          })
        );
        taxFilingClient.onboarding.mockResolvedValue({
          state: "API_ERROR",
        });
        const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          taxFilingData: {
            ...business.taxFilingData,
            state: "API_ERROR",
            registeredISO: undefined,
            businessName: taxIdBusinessName.businessName,
          },
        }));
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual(
          expectedUserData
        );
      });

      it("returns the FAILED response", async () => {
        const userData = generateUserDataForBusiness(
          generateBusiness({
            taxFilingData: generateTaxFilingData({
              state: undefined,
              lastUpdatedISO: undefined,
              registeredISO: undefined,
            }),
          })
        );
        taxFilingClient.onboarding.mockResolvedValue({
          state: "FAILED",
          errorField: "businessName",
        });

        const expectedUserData = modifyCurrentBusiness(userData, (business) => ({
          ...business,
          taxFilingData: {
            ...business.taxFilingData,
            state: "FAILED",
            registeredISO: undefined,
            errorField: "businessName",
            businessName: taxIdBusinessName.businessName,
          },
        }));
        expect(await taxFilingInterface.onboarding({ userData, ...taxIdBusinessName })).toEqual(
          expectedUserData
        );
      });
    });
  });
});
