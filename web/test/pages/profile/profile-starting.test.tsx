/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import {
  allLegalStructuresOfType,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
  randomPublicFilingLegalStructure,
} from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  userDataWasNotUpdated,
} from "@/test/mock/withStatefulUserData";
import {
  industryIdsWithOutEssentialQuestion,
  industryIdsWithSingleRequiredEssentialQuestion,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  Business,
  LookupIndustryById,
  LookupLegalStructureById,
  OperatingPhaseId,
  OperatingPhases,
  UserData,
  createEmptyBusiness,
  einTaskId,
  emptyAddressData,
  emptyIndustrySpecificData,
  formationTaskId,
  generateFormationFormData,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData,
  modifyCurrentBusiness,
  naicsCodeTaskId,
} from "@businessnjgovnavigator/shared";
import { generateFormationData, generateTaxFilingData } from "@businessnjgovnavigator/shared/test";

import analytics from "@/lib/utils/analytics";
import {
  chooseRadio,
  chooseTab,
  clickBack,
  clickSave,
  expectLocationNotSavedAndError,
  expectLocationSavedAsUndefined,
  fillText,
  generateBusinessForProfile,
  getBusinessNameValue,
  getBusinessProfileInputFieldName,
  getDateOfFormation,
  getEmployerIdValue,
  getEntityIdValue,
  getMunicipalityValue,
  getNotesValue,
  getTaxIdValue,
  removeLocationAndSave,
  renderPage,
  selectByText,
  selectByValue,
} from "@/test/pages/profile/profile-helpers";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

const Config = getMergedConfig();

const mockApi = api as jest.Mocked<typeof api>;

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      profile_location_question: {
        submit: {
          location_entered_for_first_time: jest.fn(),
        },
      },
    },
  };
}

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

describe("profile - starting business", () => {
  let businessFromSetup: Business;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    useMockDocuments({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    businessFromSetup = generateBusinessForProfile({
      profileData: generateProfileData({
        businessPersona: "STARTING",
      }),
    });
  });

  describe("locks fields when formation getFiling success", () => {
    const legalStructure = "limited-liability-company";
    const startingBusiness = generateBusinessForProfile({
      formationData: generateFormationData({
        completedFilingPayment: true,
      }),
      profileData: generateProfileData({
        dateOfFormation: "2020-01-02",
        businessPersona: "STARTING",
        legalStructureId: legalStructure,
        entityId: "some-id",
        businessName: "some-name",
      }),
    });

    it("locks businessName", () => {
      renderPage({ business: startingBusiness });
      expect(screen.getByText(Config.profileDefaults.fields.businessName.default.header)).toBeInTheDocument();
      expect(within(screen.getByTestId("main")).getByText("some-name")).toBeInTheDocument();
      expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
    });

    it("locks entityID", () => {
      renderPage({ business: startingBusiness });
      chooseTab("numbers");
      expect(screen.getByText(Config.profileDefaults.fields.entityId.default.header)).toBeInTheDocument();
      expect(screen.getByText("some-id")).toBeInTheDocument();
      expect(screen.queryByLabelText("Entity id")).not.toBeInTheDocument();
    });

    it("locks legalStructure for STARTING business Persona", async () => {
      renderPage({ business: startingBusiness });
      expect(screen.getByTestId("info")).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.legalStructureId.default.header)
      ).toBeInTheDocument();
      expect(screen.getByText(LookupLegalStructureById(legalStructure).name)).toBeInTheDocument();
      expect(
        screen.queryByText(Config.profileDefaults.default.lockedFieldTooltipText)
      ).not.toBeInTheDocument();

      expect(screen.queryByText("business-structure-task-link")).not.toBeInTheDocument();

      fireEvent.mouseOver(screen.getByTestId("legalStructureId-locked-tooltip"));
      await screen.findByText(Config.profileDefaults.default.lockedFieldTooltipText);
    });
  });

  describe("formation date", () => {
    it("does not display when empty", () => {
      const initialBusiness = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          dateOfFormation: "",
        }),
      });
      renderPage({ business: initialBusiness });
      chooseTab("numbers");
      expect(getDateOfFormation()).toBeUndefined();
    });

    it("displays when populated", () => {
      const initialBusiness = generateBusinessForProfile({
        profileData: generateProfileData({ businessPersona: "STARTING", dateOfFormation: "2020-01-01" }),
      });
      renderPage({ business: initialBusiness });
      expect(getDateOfFormation()).toBe("01/2020");
    });

    describe("formation date deletion", () => {
      it("allows user to delete formation date in profile", async () => {
        const initialBusiness = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            dateOfFormation: "2017-10-01",
          }),
        });
        renderPage({ business: initialBusiness });
        fillText("Date of formation", "");
        clickSave();
        expect(getDateOfFormation()).toBe("");
      });

      it("allows user to cancel formation date deletion", () => {
        const initialBusiness = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            dateOfFormation: "2017-10-01",
          }),
        });

        renderPage({ business: initialBusiness });
        fillText("Date of formation", "");

        clickSave();

        fireEvent.click(
          within(screen.getByRole("dialog")).getByText(Config.formationDateDeletionModal.cancelButtonText)
        );

        expect(userDataWasNotUpdated()).toBe(true);
      });

      it("allows user to delete formation date and sets task progress to IN_PROGRESS", async () => {
        const initialBusiness = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            dateOfFormation: "2017-10-01",
          }),
        });

        renderPage({ business: initialBusiness });
        fillText("Date of formation", "");

        clickSave();

        fireEvent.click(
          within(screen.getByRole("dialog")).getByText(Config.formationDateDeletionModal.deleteButtonText)
        );

        await waitFor(() => {
          expect(currentBusiness().taskProgress[formationTaskId]).toEqual("IN_PROGRESS");
        });
        expect(currentBusiness().profileData.dateOfFormation).toEqual(undefined);
      });
    });
  });

  it("displays business info tab", () => {
    renderPage({ business: businessFromSetup });
    expect(screen.getByTestId("info")).toBeInTheDocument();
  });

  it("redirects user to dashboard with success query string on save", async () => {
    renderPage({ business: businessFromSetup });
    fillText("Industry", "All Other Businesses");
    clickSave();
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith(`${ROUTES.dashboard}?success=true`);
    });
  });

  it("prevents user from going back to dashboard if there are unsaved changes", () => {
    renderPage({ business: businessFromSetup });
    const inputFieldName = getBusinessProfileInputFieldName(businessFromSetup);
    fillText(inputFieldName, "Cool Computers");
    clickBack();
    expect(screen.getByText(Config.profileDefaults.default.escapeModalReturn)).toBeInTheDocument();
  });

  it("returns user to profile page from un-saved changes modal", () => {
    renderPage({ business: businessFromSetup });
    const inputFieldName = getBusinessProfileInputFieldName(businessFromSetup);
    fillText(inputFieldName, "Cool Computers");
    clickBack();
    fireEvent.click(screen.getByText(Config.profileDefaults.default.escapeModalEscape));
    fillText(inputFieldName, "Cool Computers2");
    expect(screen.getByLabelText(inputFieldName)).toBeInTheDocument();
  });

  it("updates the user data on save", async () => {
    const emptyBusiness = createEmptyBusiness();
    const initialBusiness: Business = {
      ...emptyBusiness,
      profileData: {
        ...emptyBusiness.profileData,
        taxId: "",
        businessPersona: "STARTING",
      },
    };
    const inputFieldName = getBusinessProfileInputFieldName(initialBusiness);
    const randomMunicipality = generateMunicipality({ displayName: "Newark" });
    renderPage({ business: initialBusiness, municipalities: [randomMunicipality] });
    fillText(inputFieldName, "Cool Computers");
    selectByText("Location", randomMunicipality.displayName);
    selectByValue("Industry", "e-commerce");
    chooseRadio("home-based-business-radio-true");

    chooseTab("numbers");
    fillText("Tax id", "023456790123");
    fillText("Employer id", "02-3456780");
    chooseTab("notes");
    fillText("Notes", "whats appppppp");
    clickSave();

    await waitFor(() => {
      expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
    });
    const profileInputField =
      inputFieldName === "Business name"
        ? { businessName: "Cool Computers" }
        : { tradeName: "Cool Computers" };
    expect(currentBusiness()).toEqual({
      ...initialBusiness,
      profileData: {
        ...initialBusiness.profileData,
        ...profileInputField,
        industryId: "e-commerce",
        sectorId: "retail-trade-and-ecommerce",
        homeBasedBusiness: true,
        municipality: randomMunicipality,
        taxId: "023456790123",
        employerId: "023456780",
        notes: "whats appppppp",
      },
      taskProgress: {
        [einTaskId]: "COMPLETED",
        [naicsCodeTaskId]: "NOT_STARTED",
      },
      taskItemChecklist: {},
    });
  });

  it("updates tax filing data on save", async () => {
    const taxData = generateTaxFilingData({});
    mockApi.postGetAnnualFilings.mockImplementation((userData: UserData) => {
      const modifiedUserData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        taxFilingData: { ...taxData, filings: [] },
      }));
      return Promise.resolve(modifiedUserData);
    });

    const initialBusiness = generateBusinessForProfile({ taxFilingData: taxData });
    renderPage({ business: initialBusiness });
    clickSave();

    await waitFor(() => {
      expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
    });

    expect(currentBusiness()).toEqual({
      ...initialBusiness,
      taxFilingData: { ...taxData, filings: [] },
    });
  });

  it("sets registerForEin task to complete if employerId exists", async () => {
    renderPage({
      business: generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          employerId: undefined,
        }),
      }),
    });
    chooseTab("numbers");
    fillText("Employer id", "02-3456780");
    clickSave();
    await waitFor(() => {
      expect(currentBusiness().taskProgress).toEqual({ [einTaskId]: "COMPLETED" });
    });
  });

  describe("location", () => {
    const renderWithLegalStructureAndPhase = (params: {
      legalStructureId: string;
      operatingPhase: OperatingPhaseId;
    }): void => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          legalStructureId: params.legalStructureId,
          operatingPhase: params.operatingPhase,
          businessPersona: "STARTING",
        }),
      });
      renderPage({ business });
    };

    it("locks the location field when it is populated and tax filing state is SUCCESS", () => {
      const randomMunicipality = generateMunicipality({});
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateProfileData({
            municipality: randomMunicipality,
          }),
          taxFilingData: generateTaxFilingData({
            state: "SUCCESS",
          }),
        }),
      });
      expect(screen.getByText(randomMunicipality.displayName)).toBeInTheDocument();
      expect(screen.getByTestId("locked-municipality")).toBeInTheDocument();
    });

    describe("when location is optional", () => {
      describe("legalStructure is Public Filing and operating Phase is GUEST_MODE or NEEDS_TO_FORM", () => {
        const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
          (it) => {
            return it.id;
          }
        );
        const operatingPhases: OperatingPhaseId[] = [
          OperatingPhaseId.GUEST_MODE,
          OperatingPhaseId.NEEDS_TO_FORM,
        ];

        for (const legalStructure of allPublicFilingLegalStructures) {
          for (const operatingPhase of operatingPhases) {
            it(`allows saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
              renderWithLegalStructureAndPhase({
                legalStructureId: legalStructure,
                operatingPhase: operatingPhase,
              });
              removeLocationAndSave();
              await expectLocationSavedAsUndefined();
            });
          }
        }
      });

      describe("legalStructure is Trade Name and operating Phase is GUEST_MODE", () => {
        const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
          return it.id;
        });

        for (const legalStructure of allTradeNameLegalStructures) {
          it(`allows saving with empty location for ${legalStructure} in GUEST_MODE`, async () => {
            renderWithLegalStructureAndPhase({
              legalStructureId: legalStructure,
              operatingPhase: OperatingPhaseId.GUEST_MODE,
            });
            removeLocationAndSave();
            await expectLocationSavedAsUndefined();
          });
        }
      });
    });

    describe("when location is required", () => {
      describe("legalStructure is Public Filing and operating Phase is FORMED", () => {
        const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
          (it) => {
            return it.id;
          }
        );
        for (const legalStructure of allPublicFilingLegalStructures) {
          it(`prevents saving with empty location for ${legalStructure} in FORMED`, async () => {
            renderWithLegalStructureAndPhase({
              legalStructureId: legalStructure,
              operatingPhase: OperatingPhaseId.FORMED,
            });
            removeLocationAndSave();
            expectLocationNotSavedAndError();
          });
        }
      });

      describe("legalStructure is Trade Name and operating Phase is FORMED", () => {
        const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
          return it.id;
        });
        for (const legalStructure of allTradeNameLegalStructures) {
          it(`prevents saving with empty location for ${legalStructure}`, async () => {
            renderWithLegalStructureAndPhase({
              legalStructureId: legalStructure,
              operatingPhase: OperatingPhaseId.FORMED,
            });
            removeLocationAndSave();
            expectLocationNotSavedAndError();
          });
        }
      });
    });
  });

  it("entity-id field existing depends on legal structure when starting", () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        legalStructureId: "general-partnership",
        businessPersona: "STARTING",
      }),
    });
    renderPage({ business });
    chooseTab("numbers");
    expect(screen.queryByText(Config.profileDefaults.fields.entityId.default.header)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Entity id")).not.toBeInTheDocument();
  });

  it("prevents user from saving if they partially entered Employer Id", async () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        legalStructureId: "general-partnership",
        businessPersona: "STARTING",
      }),
    });
    renderPage({ business });
    chooseTab("numbers");
    fillText("Employer id", "123490");
    fireEvent.blur(screen.queryByLabelText("Employer id") as HTMLElement);
    clickSave();
    await waitFor(() => {
      expect(
        screen.getByText(
          templateEval(Config.onboardingDefaults.errorTextMinimumNumericField, { length: "9" })
        )
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
  });

  it("user is able to go back to dashboard", async () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    renderPage({ business });
    clickBack();
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
  });

  describe("the tax ID field behavior", () => {
    describe("when the tax ID is initially 9 digits in length", () => {
      const businessWith9TaxId = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
          taxId: "123456789",
        }),
      });

      it("will save if tax ID does not change", async () => {
        renderPage({ business: businessWith9TaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"));
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual(businessWith9TaxId);
        });
      });

      it("will not save if tax ID changes to a different 9 digit tax Id", async () => {
        renderPage({ business: businessWith9TaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "666666666" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(userDataWasNotUpdated()).toEqual(true);
        });
        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
        ).toBeInTheDocument();
        expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
      });

      it("will save if Tax ID changes to 12 digits in length", async () => {
        renderPage({ business: businessWith9TaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        fireEvent.change(screen.getByLabelText("Tax id location"), { target: { value: "123" } });
        fireEvent.blur(screen.getByLabelText("Tax id location"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual({
            ...businessWith9TaxId,
            taxFilingData: {
              ...businessWith9TaxId.taxFilingData,
              filings: [],
              state: undefined,
              registeredISO: undefined,
            },
            profileData: { ...businessWith9TaxId.profileData, taxId: "123456789123" },
          });
        });
      });

      it("will save if tax ID changes to 0 digits in length", async () => {
        renderPage({ business: businessWith9TaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual({
            ...businessWith9TaxId,
            taxFilingData: {
              ...businessWith9TaxId.taxFilingData,
              filings: [],
              state: undefined,
              registeredISO: undefined,
            },
            profileData: { ...businessWith9TaxId.profileData, taxId: "" },
          });
        });
      });
    });

    describe("when the tax ID is initially 12 digits in length", () => {
      const businessWith12TaxId = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
          taxId: "123456789123",
        }),
      });

      it("will save if tax ID does not change", async () => {
        renderPage({ business: businessWith12TaxId });
        chooseTab("numbers");
        fireEvent.click(screen.getByLabelText("Tax id"));
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual(businessWith12TaxId);
        });
      });

      it("will not save if tax ID is less than 12 digits in length", async () => {
        renderPage({ business: businessWith12TaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(userDataWasNotUpdated()).toEqual(true);
        });
      });

      it("will save if Tax ID changes to a different 12 digits", async () => {
        renderPage({ business: businessWith12TaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "666666666666" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual({
            ...businessWith12TaxId,
            taxFilingData: {
              ...businessWith12TaxId.taxFilingData,
              filings: [],
              state: undefined,
              registeredISO: undefined,
            },
            profileData: { ...businessWith12TaxId.profileData, taxId: "666666666666" },
          });
        });
      });
    });

    describe("when the tax ID is initially 0  in length", () => {
      const businessWithEmptyTaxId = generateBusinessForProfile({
        profileData: generateProfileData({
          taxId: "",
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
        }),
      });

      it("will save if tax ID does not change", async () => {
        renderPage({ business: businessWithEmptyTaxId });
        chooseTab("numbers");
        fireEvent.click(screen.getByLabelText("Tax id"));
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual(businessWithEmptyTaxId);
        });
      });

      it("will not save if tax ID is less than 12 digits in length", async () => {
        renderPage({ business: businessWithEmptyTaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(userDataWasNotUpdated()).toEqual(true);
        });
      });

      it("will save if Tax ID changes to 12 digits in length", async () => {
        renderPage({ business: businessWithEmptyTaxId });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789123" } });
        fireEvent.blur(screen.getByLabelText("Tax id"));
        clickSave();
        await waitFor(() => {
          return expect(currentBusiness()).toEqual({
            ...businessWithEmptyTaxId,
            taxFilingData: {
              ...businessWithEmptyTaxId.taxFilingData,
              filings: [],
              state: undefined,
              registeredISO: undefined,
            },
            profileData: { ...businessWithEmptyTaxId.profileData, taxId: "123456789123" },
          });
        });
      });
    });
  });

  it("prefills form from existing user data", () => {
    const randomMunicipality = generateMunicipality({});
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        businessName: "Applebees",
        legalStructureId: randomPublicFilingLegalStructure(),
        industryId: "cosmetology",
        entityId: "1234567890",
        employerId: "123456789",
        taxId: "123456790",
        notes: "whats appppppp",
        municipality: randomMunicipality,
      }),
    });

    renderPage({ business });
    expect(getBusinessNameValue()).toEqual("Applebees");

    expect(getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);
    expect(getMunicipalityValue()).toEqual(randomMunicipality.displayName);
    chooseTab("numbers");
    expect(getEmployerIdValue()).toEqual("12-3456789");
    expect(getEntityIdValue()).toEqual("1234567890");
    expect(getTaxIdValue()).toEqual("123-456-790");
    chooseTab("notes");
    expect(getNotesValue()).toEqual("whats appppppp");
  });

  it("returns user to dashboard from un-saved changes modal", async () => {
    const initialBusiness = generateBusinessForProfile({
      profileData: generateProfileData({ businessPersona: "STARTING" }),
    });
    const randomMunicipality = generateMunicipality({});
    renderPage({ business: initialBusiness, municipalities: [randomMunicipality] });
    selectByText("Location", randomMunicipality.displayName);
    clickBack();
    fireEvent.click(screen.getByText(Config.profileDefaults.default.escapeModalReturn));
    await waitFor(() => {
      return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
    await waitFor(() => {
      return expect(() => {
        return currentBusiness();
      }).toThrow();
    });
  });

  describe("existing employees field and ownership field", () => {
    const operatingPhaseIdsExcludingFormedAndUpAndRunning: OperatingPhaseId[] = [
      OperatingPhaseId.GUEST_MODE,
      OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE,
      OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
      OperatingPhaseId.NEEDS_TO_FORM,
    ];

    it.each(operatingPhaseIdsExcludingFormedAndUpAndRunning)(
      `does not render the existing employees field and ownership field when phase is %s`,
      (operatingPhase: OperatingPhaseId) => {
        const initialBusiness = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: operatingPhase,
          }),
        });
        renderPage({ business: initialBusiness });

        expect(screen.queryByLabelText("Existing employees")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Ownership")).not.toBeInTheDocument();
      }
    );

    it("renders the existing employees field and ownership field when phase is FORMED", () => {
      const initialBusiness = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.FORMED,
        }),
      });
      renderPage({ business: initialBusiness });

      expect(screen.getByLabelText("Existing employees")).toBeInTheDocument();
      expect(screen.getByLabelText("Ownership")).toBeInTheDocument();
    });

    it("renders the existing employees field and ownership field when phase is UP_AND_RUNNING", () => {
      const initialBusiness = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
        }),
      });
      renderPage({ business: initialBusiness });

      expect(screen.getByLabelText("Existing employees")).toBeInTheDocument();
      expect(screen.getByLabelText("Ownership")).toBeInTheDocument();
    });

    it("allows user to save if existing employees field is empty", async () => {
      const initialBusiness = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          existingEmployees: "1",
        }),
      });
      renderPage({ business: initialBusiness });

      fillText("Existing employees", "");
      fireEvent.blur(screen.queryByLabelText("Existing employees") as HTMLElement);
      clickSave();

      await waitFor(() => {
        expect(currentBusiness().profileData.existingEmployees).toEqual("");
      });
    });
  });

  it("displays the sector dropdown when industry is generic", () => {
    renderPage({
      business: generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
        }),
      }),
    });
    expect(screen.getByLabelText("Sector")).toBeInTheDocument();
  });

  it.each(OperatingPhases.filter((it) => !it.sectorRequired).map((it) => it.id))(
    "does not require sector when %s phase",
    (phase) => {
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateProfileData({
            operatingPhase: phase,
            businessPersona: "STARTING",
            industryId: "generic",
            legalStructureId: "limited-liability-partnership",
            sectorId: undefined,
          }),
        }),
      });
      expect(screen.getByLabelText("Sector")).toBeInTheDocument();
      chooseTab("numbers");
      expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
      const header = screen.getByTestId("profile-tab-header");
      expect(
        within(header).getByText(Config.profileDefaults.default.profileTabNumbersTitle)
      ).toBeInTheDocument();
      expect(
        within(header).queryByText(Config.profileDefaults.default.profileTabInfoTitle)
      ).not.toBeInTheDocument();
    }
  );

  it.each(OperatingPhases.filter((it) => it.sectorRequired).map((it) => it.id))(
    "requires sector when %s phase",
    (phase) => {
      renderPage({
        business: generateBusinessForProfile({
          profileData: generateProfileData({
            operatingPhase: phase,
            businessPersona: "STARTING",
            industryId: "generic",
            sectorId: undefined,
          }),
        }),
      });
      expect(screen.getByLabelText("Sector")).toBeInTheDocument();
      chooseTab("numbers");
      expect(screen.getByLabelText("Sector")).toBeInTheDocument();
      const header = screen.getByTestId("profile-tab-header");
      expect(
        within(header).getByText(Config.profileDefaults.default.profileTabInfoTitle)
      ).toBeInTheDocument();
      expect(
        within(header).queryByText(Config.profileDefaults.default.profileTabNumbersTitle)
      ).not.toBeInTheDocument();
    }
  );

  it.each(industryIdsWithOutEssentialQuestion.filter((industry) => industry !== "generic"))(
    "saves userData when sector dropdown is removed from DOM when %s industry is selected",
    async (industry) => {
      const newIndustry = industry;

      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
          sectorId: undefined,
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
          legalStructureId: "limited-liability-company",
          ...emptyIndustrySpecificData,
        }),
        onboardingFormProgress: "COMPLETED",
      });
      renderPage({ business });
      fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
        ).toBeInTheDocument();
      });
      selectByValue("Industry", newIndustry);
      await waitFor(() => {
        expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
      });
      clickSave();
      await waitFor(() => {
        expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
      });
      expect(currentBusiness()).toEqual(
        expect.objectContaining({
          ...business,
          onboardingFormProgress: "COMPLETED",
          profileData: {
            ...business.profileData,
            industryId: newIndustry,
            sectorId: LookupIndustryById(newIndustry).defaultSectorId,
            homeBasedBusiness: isHomeBasedBusinessApplicable(newIndustry) ? undefined : false,
            naicsCode: "",
            nonEssentialRadioAnswers: expect.anything(),
          },
          taskProgress: {
            ...business.taskProgress,
            [naicsCodeTaskId]: "NOT_STARTED",
          },
          taskItemChecklist: {},
        })
      );
    }
  );

  it("prevents user from saving if in up-and-running and sector is not selected", async () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        industryId: "generic",
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
        sectorId: undefined,
      }),
    });
    renderPage({ business });
    fireEvent.blur(screen.getByLabelText("Sector") as HTMLElement);

    clickSave();
    await waitFor(() => {
      expect(
        screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
      ).toBeInTheDocument();
    });
    expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
  });

  describe("business name not required", () => {
    const allOperatingPhases: OperatingPhaseId[] = OperatingPhases.map((it) => it.id);

    for (const phase of allOperatingPhases) {
      it(`allows user to save with empty business name in ${phase} phase`, async () => {
        const business = generateBusinessForProfile({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: phase,
            businessName: "",
            legalStructureId: "limited-liability-company",
          }),
        });
        renderPage({ business });
        fireEvent.blur(screen.getByLabelText("Business name") as HTMLElement);

        clickSave();
        await waitFor(() => {
          expect(userDataUpdatedNTimes()).toEqual(1);
        });
        expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
      });
    }
  });

  it("shows the home-based question if applicable to industry", () => {
    renderPage({
      business: generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: randomHomeBasedIndustry(),
        }),
      }),
    });
    expect(screen.getByLabelText("Home based business")).toBeInTheDocument();
  });

  it("shows the home-based question when user changes to applicable industry, even before saving", () => {
    renderPage({
      business: generateBusinessForProfile({
        profileData: generateProfileData({
          industryId: randomNonHomeBasedIndustry(),
          businessPersona: "STARTING",
        }),
      }),
    });
    expect(screen.queryByLabelText("Home based business")).not.toBeInTheDocument();

    selectByValue("Industry", randomHomeBasedIndustry());
    expect(screen.getByLabelText("Home based business")).toBeInTheDocument();
  });

  it("shows the home-based question when industry is undefined", () => {
    renderPage({
      business: generateBusinessForProfile({
        profileData: generateProfileData({
          industryId: undefined,
          businessPersona: "STARTING",
        }),
      }),
    });
    expect(screen.getByLabelText("Home based business")).toBeInTheDocument();
  });

  it("does not show the home-based question if not applicable to industry", () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: randomNonHomeBasedIndustry(),
        businessPersona: "STARTING",
      }),
    });
    renderPage({ business });

    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
    ).not.toBeInTheDocument();
  });

  it("resets naicsCode task and data when the industry is changed and page is saved", async () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: "cosmetology",
        businessPersona: "STARTING",
      }),
      taskProgress: {
        [naicsCodeTaskId]: "COMPLETED",
      },
    });
    renderPage({ business });
    selectByValue("Industry", "e-commerce");
    clickSave();

    await waitFor(() => {
      expect(currentBusiness().taskProgress[naicsCodeTaskId]).toEqual("NOT_STARTED");
    });
    expect(currentBusiness().profileData.naicsCode).toEqual("");
  });

  it("resets all task checkbox data data when the industry is changed and page is saved", async () => {
    const business = generateBusinessForProfile({
      profileData: generateProfileData({
        industryId: "cosmetology",
        businessPersona: "STARTING",
      }),
      taskProgress: {
        [naicsCodeTaskId]: "COMPLETED",
      },
      taskItemChecklist: { key1: true },
    });
    renderPage({ business });
    selectByValue("Industry", "e-commerce");
    clickSave();

    await waitFor(() => {
      expect(currentBusiness().taskItemChecklist).toEqual({});
    });
  });

  it.each(industryIdsWithSingleRequiredEssentialQuestion)(
    "prevents user from saving when %s is selected as industry, but essential question is not answered",
    async (industryId) => {
      const business = generateBusinessForProfile({
        onboardingFormProgress: "UNSTARTED",
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: industryId,
          ...emptyIndustrySpecificData,
        }),
      });
      renderPage({ business });
      clickSave();
      await waitFor(() => {
        expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
      });
    }
  );

  it("prevents user from saving when employment agency is selected as industry, but essential question is not answered", async () => {
    const business = generateBusinessForProfile({
      onboardingFormProgress: "UNSTARTED",
      profileData: generateProfileData({
        businessPersona: "STARTING",
        industryId: "employment-agency",
        ...emptyIndustrySpecificData,
      }),
    });
    renderPage({ business });
    clickSave();
    await waitFor(() => {
      expect(screen.getAllByText(Config.siteWideErrorMessages.errorRadioButton)[0]).toBeInTheDocument();
    });
  });

  describe("Document Section", () => {
    it("shows document section if user's legal structure requires public filing", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
        }),
      });
      renderPage({ business });
      chooseTab("documents");
      expect(screen.getByTestId("profileContent-documents")).toBeInTheDocument();
    });

    it("removes document section if user's legal structure does not require public filing", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderPage({ business });
      expect(screen.queryByTestId("documents")).not.toBeInTheDocument();
      expect(screen.queryByTestId("profileContent-documents")).not.toBeInTheDocument();
    });

    it("shows placeholder text if there are no documents", () => {
      const business = generateBusinessForProfile({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" },
        }),
      });
      renderPage({ business });
      chooseTab("documents");
      expect(
        screen.getByText(Config.profileDefaults.fields.documents.default.placeholder.split("[")[0], {
          exact: false,
        })
      ).toBeInTheDocument();
    });

    it("shows document links", () => {
      const business = generateBusinessForProfile({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol" },
        }),
      });
      renderPage({ business });
      chooseTab("documents");
      expect(screen.queryByText("test12345")).not.toBeInTheDocument();
      expect(screen.getByText(Config.profileDefaults.default.formationDocFileTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.profileDefaults.default.certificationDocFileTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.profileDefaults.default.standingDocFileTitle)).toBeInTheDocument();
    });

    it("uses links from useDocuments hook", () => {
      setMockDocumentsResponse({
        formationDoc: "testForm.pdf",
        certifiedDoc: "testCert.pdf",
        standingDoc: "testStand.pdf",
      });
      const business = generateBusinessForProfile({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "pz.zip", formationDoc: "whatever.pdf", standingDoc: "lol" },
        }),
      });
      renderPage({ business });
      chooseTab("documents");

      expect(screen.getByText(Config.profileDefaults.default.formationDocFileTitle)).toHaveAttribute(
        "href",
        "testForm.pdf"
      );
      expect(screen.getByText(Config.profileDefaults.default.standingDocFileTitle)).toHaveAttribute(
        "href",
        "testStand.pdf"
      );
      expect(screen.getByText(Config.profileDefaults.default.certificationDocFileTitle)).toHaveAttribute(
        "href",
        "testCert.pdf"
      );
    });

    it("hides document links if they do not exist", () => {
      const business = generateBusinessForProfile({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "pp.zip", formationDoc: "whatever.pdf", standingDoc: "" },
        }),
      });

      renderPage({ business });
      chooseTab("documents");

      expect(screen.getByText(Config.profileDefaults.default.formationDocFileTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.profileDefaults.default.certificationDocFileTitle)).toBeInTheDocument();
      expect(screen.queryByText(Config.profileDefaults.default.standingDocFileTitle)).not.toBeInTheDocument();
    });
  });

  describe("trade name field behavior", () => {
    it("displays trade name field as editable if it's a trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderPage({ business });
      expect(screen.getByTestId("tradeName")).toBeInTheDocument();
    });

    it("hides trade name field if it's a non trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
        }),
      });
      renderPage({ business });
      expect(screen.queryByTestId("tradeName")).not.toBeInTheDocument();
    });
  });

  describe("responsible owner name field behavior", () => {
    it("displays responsibleOwnerName field if starting a trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "general-partnership",
        }),
      });
      renderPage({ business });
      expect(screen.getByTestId("responsibleOwnerName")).toBeInTheDocument();
    });

    it("hides responsibleOwnerName field if it's a non trade name business", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
        }),
      });
      renderPage({ business });
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });

    it("displays responsibleOwnerName as locked if user has accessed tax data", () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
        taxFilingData: generateTaxFilingData({
          state: "PENDING",
        }),
      });
      renderPage({ business });
      expect(
        screen.getByText(Config.profileDefaults.fields.responsibleOwnerName.default.header)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });
  });

  describe("non essential questions", () => {
    it("shows elevator questions for starting businesses", async () => {
      const business = generateBusinessForProfile({
        profileData: generateProfileData({
          industryId: "generic",
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.GUEST_MODE,
          homeBasedBusiness: false,
        }),
        formationData: generateFormationData({
          formationFormData: generateFormationFormData({
            ...emptyAddressData,
          }),
        }),
      });
      renderPage({ business });

      expect(screen.getByTestId("elevatorOwningBusiness-radio-group")).toBeInTheDocument();
    });
  });

  const getIndustryValue = (): string => {
    return (screen.queryByTestId("industryId") as HTMLInputElement)?.value;
  };
});
