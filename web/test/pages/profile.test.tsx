/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ProfileTabs } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import Profile from "@/pages/profile";
import {
  allLegalStructuresOfType,
  randomHomeBasedIndustry,
  randomNonHomeBasedIndustry,
  randomPublicFilingLegalStructure,
  randomTradeNameLegalStructure,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulProfileFormContext } from "@/test/mock/withStatefulProfileData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  industryIdsWithOutEssentialQuestion,
  industryIdsWithRequiredEssentialQuestion,
} from "@/test/pages/onboarding/helpers-onboarding";
import {
  businessPersonas,
  createEmptyUserData,
  defaultDateFormat,
  einTaskId,
  emptyIndustrySpecificData,
  ForeignBusinessType,
  FormationData,
  formationTaskId,
  generateMunicipality,
  generateProfileData,
  getCurrentDate,
  getCurrentDateFormatted,
  LookupIndustryById,
  LookupLegalStructureById,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
  Municipality,
  naicsCodeTaskId,
  OperatingPhase,
  OperatingPhaseId,
  OperatingPhases,
  ProfileData,
  randomInt,
  TaskProgress,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateTaxFilingData,
  generateUser,
  generateUserData as _generateUserData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";

import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const date = getCurrentDate().subtract(1, "month").date(1);
const Config = getMergedConfig();

const dateOfFormation = date.format(defaultDateFormat);
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

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

const generateUserData = (overrides: Partial<UserData>): UserData => {
  const profileData = generateProfileData({ ...overrides.profileData });
  const taskProgress: Record<string, TaskProgress> =
    profileData.employerId && profileData.employerId.length > 0
      ? { [einTaskId]: "COMPLETED", ...overrides.taskProgress }
      : { ...overrides.taskProgress };
  return _generateUserData({ ...overrides, profileData, taskProgress });
};

describe("profile", () => {
  let setRegistrationModalIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setRegistrationModalIsVisible = jest.fn();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    useMockDocuments({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
  });

  const renderPage = ({
    municipalities,
    userData,
    isAuthenticated,
  }: {
    municipalities?: Municipality[];
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
  }): void => {
    const genericTown =
      userData && userData.profileData.municipality
        ? userData.profileData.municipality
        : generateMunicipality({ displayName: "GenericTown" });
    render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <WithStatefulProfileFormContext>
            <WithStatefulUserData
              initialUserData={
                userData ||
                generateUserData({
                  profileData: generateProfileData({
                    municipality: genericTown,
                  }),
                })
              }
            >
              <Profile municipalities={municipalities ? [genericTown, ...municipalities] : [genericTown]} />
            </WithStatefulUserData>
          </WithStatefulProfileFormContext>
        </ThemeProvider>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { registrationModalIsVisible: false, setRegistrationModalIsVisible }
      )
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    render(
      <WithStatefulUserData initialUserData={undefined}>
        <Profile municipalities={[]} />
      </WithStatefulUserData>
    );

    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults.pageTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.profileDefaults.pageTitle)).not.toBeInTheDocument();
  });

  describe("guest mode", () => {
    let initialUserData: UserData;

    describe("when prospective business owner", () => {
      beforeEach(() => {
        initialUserData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "limited-liability-company",
          }),
        });
      });

      opensModalWhenEditingNonGuestModeProfileFields();
    });

    describe("when owning a business", () => {
      beforeEach(() => {
        initialUserData = generateUserData({
          profileData: generateProfileData({ businessPersona: "OWNING" }),
        });
      });

      opensModalWhenEditingNonGuestModeProfileFields();

      it("opens registration modal when user tries to change Tax PIN", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax pin"), { target: { value: "123456789" } });
        expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });
    });

    function opensModalWhenEditingNonGuestModeProfileFields(): void {
      it("user is able to edit name and save", async () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        const inputFieldName = getBusinessProfileInputFieldName(initialUserData);
        fillText(inputFieldName, "Cool Computers");
        clickSave();
        await waitFor(() => {
          return expect(mockRouter.mockPush).toHaveBeenCalled();
        });
      });

      it("opens registration modal when user tries to change EIN", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Employer id"), { target: { value: "123456789" } });
        expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });

      it("opens registration modal when user tries to change entity ID", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Entity id"), { target: { value: "123456789" } });
        expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });

      it("opens registration modal when user tries to change NJ Tax ID", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
        expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });

      it("opens registration modal when user tries to change Notes", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("notes");
        fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "some note" } });
        expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });
    }
  });

  describe("starting new business", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: randomLegalStructure().id,
        }),
      });
    });

    describe("locks fields when formation getFiling success", () => {
      const legalStructure = "limited-liability-company";
      const municipality = generateMunicipality({
        displayName: "some-cool-town",
      });
      const startingUserData = generateUserData({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
        profileData: generateProfileData({
          dateOfFormation: "2020-01-02",
          businessPersona: "STARTING",
          legalStructureId: legalStructure,
          entityId: "some-id",
          businessName: "some-name",
          municipality: municipality,
        }),
      });

      const foreignNexusUserData = generateUserData({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
        profileData: generateProfileData({
          dateOfFormation: "2020-01-02",
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          foreignBusinessTypeIds: ["NEXUS"],
          legalStructureId: legalStructure,
          entityId: "some-id",
          businessName: "some-name",
          municipality: municipality,
        }),
      });

      it("locks businessName", () => {
        renderPage({ userData: startingUserData });
        expect(
          screen.getByText(Config.profileDefaults.fields.businessName.default.header)
        ).toBeInTheDocument();
        expect(screen.getByText("some-name")).toBeInTheDocument();
        expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
      });

      it("locks entityID", () => {
        renderPage({ userData: startingUserData });
        chooseTab("numbers");
        expect(screen.getByText(Config.profileDefaults.fields.entityId.default.header)).toBeInTheDocument();
        expect(screen.getByText("some-id")).toBeInTheDocument();
        expect(screen.queryByLabelText("Entity id")).not.toBeInTheDocument();
      });

      it("locks legalStructure for STARTING business Persona", async () => {
        renderPage({ userData: startingUserData });
        expect(screen.getByTestId("info")).toBeInTheDocument();
        expect(
          screen.getByText(Config.profileDefaults.fields.legalStructureId.default.header)
        ).toBeInTheDocument();
        expect(screen.getByText(LookupLegalStructureById(legalStructure).name)).toBeInTheDocument();
        expect(screen.queryByText(Config.profileDefaults.lockedFieldTooltipText)).not.toBeInTheDocument();

        expect(screen.queryByText("business-structure-task-link")).not.toBeInTheDocument();

        fireEvent.mouseOver(screen.getByTestId("business-structure-tooltip"));
        await screen.findByText(Config.profileDefaults.lockedFieldTooltipText);
      });

      it("locks legalStructure for FOREIGN business Persona", async () => {
        renderPage({ userData: foreignNexusUserData });
        expect(screen.getByTestId("info")).toBeInTheDocument();
        expect(
          screen.getByText(Config.profileDefaults.fields.legalStructureId.default.header)
        ).toBeInTheDocument();
        expect(screen.getByText(LookupLegalStructureById(legalStructure).name)).toBeInTheDocument();
        expect(screen.queryByText(Config.profileDefaults.lockedFieldTooltipText)).not.toBeInTheDocument();

        expect(screen.queryByText("business-structure-task-link")).not.toBeInTheDocument();

        fireEvent.mouseOver(screen.getByTestId("business-structure-tooltip"));
        await screen.findByText(Config.profileDefaults.lockedFieldTooltipText);
      });
    });

    describe("formation date", () => {
      it("does not display when empty", () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            dateOfFormation: "",
            legalStructureId: randomLegalStructure().id,
          }),
        });
        const newark = generateMunicipality({ displayName: "Newark" });
        renderPage({ userData: initialUserData, municipalities: [newark] });
        chooseTab("numbers");
        expect(getDateOfFormation()).toBeUndefined();
      });

      it("displays when populated", () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({ businessPersona: "STARTING", dateOfFormation: "2020-01-01" }),
        });
        const newark = generateMunicipality({ displayName: "Newark" });
        renderPage({ userData: initialUserData, municipalities: [newark] });
        expect(getDateOfFormation()).toBe("01/2020");
      });

      describe("formation date deletion", () => {
        it("allows user to delete formation date in profile", async () => {
          const initialUserData = generateUserData({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              dateOfFormation: "2017-10-01",
              legalStructureId: randomLegalStructure().id,
            }),
          });
          const newark = generateMunicipality({ displayName: "Newark" });
          renderPage({ userData: initialUserData, municipalities: [newark] });
          fillText("Date of formation", "");
          clickSave();
          expect(getDateOfFormation()).toBe("");
        });

        it("allows user to cancel formation date deletion", () => {
          const initialUserData = generateUserData({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              dateOfFormation: "2017-10-01",
              legalStructureId: randomLegalStructure().id,
            }),
          });
          const newark = generateMunicipality({ displayName: "Newark" });

          renderPage({ userData: initialUserData, municipalities: [newark] });
          fillText("Date of formation", "");

          clickSave();

          fireEvent.click(
            within(screen.getByRole("dialog")).getByText(Config.formationDateDeletionModal.cancelButtonText)
          );

          expect(userDataWasNotUpdated()).toBe(true);
        });

        it("allows user to delete formation date and sets task progress to IN_PROGRESS", async () => {
          const initialUserData = generateUserData({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              dateOfFormation: "2017-10-01",
              legalStructureId: randomLegalStructure().id,
            }),
          });
          const newark = generateMunicipality({ displayName: "Newark" });

          renderPage({ userData: initialUserData, municipalities: [newark] });
          fillText("Date of formation", "");

          clickSave();

          fireEvent.click(
            within(screen.getByRole("dialog")).getByText(Config.formationDateDeletionModal.deleteButtonText)
          );

          await waitFor(() => {
            expect(currentUserData().taskProgress[formationTaskId]).toEqual("IN_PROGRESS");
          });
          expect(currentUserData().profileData.dateOfFormation).toEqual(undefined);
        });
      });
    });

    it("displays business info tab", () => {
      renderPage({ userData });
      expect(screen.getByTestId("info")).toBeInTheDocument();
    });

    it("redirects user to dashboard with success query string on save", async () => {
      renderPage({ userData });
      fillText("Industry", "All Other Businesses");
      clickSave();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith(`${ROUTES.dashboard}?success=true`);
      });
    });

    it("prevents user from going back to dashboard if there are unsaved changes", () => {
      renderPage({ userData });
      const inputFieldName = getBusinessProfileInputFieldName(userData);
      fillText(inputFieldName, "Cool Computers");
      clickBack();
      expect(screen.getByText(Config.profileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", () => {
      renderPage({ userData });
      const inputFieldName = getBusinessProfileInputFieldName(userData);
      fillText(inputFieldName, "Cool Computers");
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalEscape));
      fillText(inputFieldName, "Cool Computers2");
      expect(screen.getByLabelText(inputFieldName)).toBeInTheDocument();
    });

    it("updates the user data on save", async () => {
      const emptyData = createEmptyUserData(generateUser({}));
      const initialUserData: UserData = {
        ...emptyData,
        profileData: {
          ...emptyData.profileData,
          taxId: "",
          businessPersona: "STARTING",
          legalStructureId: randomLegalStructure().id,
        },
      };
      const inputFieldName = getBusinessProfileInputFieldName(initialUserData);
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      fillText(inputFieldName, "Cool Computers");
      selectByText("Location", newark.displayName);
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
      expect(currentUserData()).toEqual({
        ...initialUserData,
        profileData: {
          ...initialUserData.profileData,
          ...profileInputField,
          industryId: "e-commerce",
          sectorId: "retail-trade-and-ecommerce",
          homeBasedBusiness: true,
          municipality: newark,
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
        return Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } });
      });
      const initialUserData = generateUserData({
        taxFilingData: taxData,
        profileData: generateProfileData({ legalStructureId: randomLegalStructure().id }),
      });
      renderPage({ userData: initialUserData });
      clickSave();

      await waitFor(() => {
        expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
      });

      expect(currentUserData()).toEqual({
        ...initialUserData,
        taxFilingData: { ...taxData, filings: [] },
      });
    });

    it("sets registerForEin task to complete if employerId exists", async () => {
      renderPage({
        userData: generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            employerId: undefined,
            legalStructureId: randomLegalStructure().id,
          }),
        }),
      });
      chooseTab("numbers");
      fillText("Employer id", "02-3456780");
      clickSave();
      await waitFor(() => {
        expect(currentUserData().taskProgress).toEqual({ [einTaskId]: "COMPLETED" });
      });
    });

    describe("location", () => {
      const renderWithLegalStructureAndPhase = (params: {
        legalStructureId: string;
        operatingPhase: OperatingPhaseId;
      }): void => {
        const newark = generateMunicipality({ displayName: "Newark" });
        const userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: params.legalStructureId,
            operatingPhase: params.operatingPhase,
            businessPersona: "STARTING",
          }),
        });
        renderPage({ municipalities: [newark], userData });
      };

      it("locks the location field when it is populated and tax filing state is SUCCESS", () => {
        renderPage({
          userData: generateUserData({
            profileData: generateProfileData({
              municipality: generateMunicipality({ displayName: "Trenton" }),
            }),
            taxFilingData: generateTaxFilingData({
              state: "SUCCESS",
            }),
          }),
        });
        expect(screen.getByText("Trenton")).toBeInTheDocument();
        expect(screen.getByTestId("locked-municipality")).toBeInTheDocument();
      });

      describe("when location is optional", () => {
        describe("legalStructure is Public Filing and operating Phase is GUEST_MODE or NEEDS_TO_FORM", () => {
          const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
            (it) => {
              return it.id;
            }
          );
          const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_FORM"];

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

        describe("legalStructure is Trade Name and operating Phase is GUEST_MODE or NEEDS_TO_REGISTER", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });
          const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_REGISTER_FOR_TAXES"];

          for (const legalStructure of allTradeNameLegalStructures) {
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
      });

      describe("when location is required", () => {
        describe("legalStructure is Public Filing and operating Phase is NEEDS_TO_REGISTER_FOR_TAXES or FORMED_AND_REGISTERED", () => {
          const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
            (it) => {
              return it.id;
            }
          );
          const operatingPhases: OperatingPhaseId[] = [
            "NEEDS_TO_REGISTER_FOR_TAXES",
            "FORMED_AND_REGISTERED",
          ];
          for (const legalStructure of allPublicFilingLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                expectLocationNotSavedAndError();
              });
            }
          }
        });

        describe("legalStructure is Trade Name and operating Phase is FORMED_AND_REGISTERED", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });
          for (const legalStructure of allTradeNameLegalStructures) {
            it(`prevents saving with empty location for ${legalStructure}`, async () => {
              renderWithLegalStructureAndPhase({
                legalStructureId: legalStructure,
                operatingPhase: "FORMED_AND_REGISTERED",
              });
              removeLocationAndSave();
              expectLocationNotSavedAndError();
            });
          }
        });
      });
    });

    it("entity-id field existing depends on legal structure when starting", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: "general-partnership",
          businessPersona: "STARTING",
        }),
      });
      renderPage({ userData });
      chooseTab("numbers");
      expect(
        screen.queryByText(Config.profileDefaults.fields.entityId.default.header)
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Entity id")).not.toBeInTheDocument();
    });

    it("prevents user from saving if they partially entered Employer Id", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: "general-partnership",
          businessPersona: "STARTING",
        }),
      });
      renderPage({ userData });
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
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });
      renderPage({ userData });
      clickBack();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
    });

    describe("the tax ID field behavior", () => {
      describe("when the tax ID is initially 9 digits in length", () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            taxId: "123456789",
            legalStructureId: randomLegalStructure().id,
          }),
        });

        it("will save if tax ID does not change", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"));
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual(userData);
          });
        });

        it("will not save if tax ID changes to a different 9 digit tax Id", async () => {
          renderPage({ userData });
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
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
          fireEvent.blur(screen.getByLabelText("Tax id"));
          fireEvent.change(screen.getByLabelText("Tax id location"), { target: { value: "123" } });
          fireEvent.blur(screen.getByLabelText("Tax id location"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual({
              ...userData,
              taxFilingData: {
                ...userData.taxFilingData,
                filings: [],
                state: undefined,
                registeredISO: undefined,
              },
              profileData: { ...userData.profileData, taxId: "123456789123" },
            });
          });
        });

        it("will save if tax ID changes to 0 digits in length", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "" } });
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual({
              ...userData,
              taxFilingData: {
                ...userData.taxFilingData,
                filings: [],
                state: undefined,
                registeredISO: undefined,
              },
              profileData: { ...userData.profileData, taxId: "" },
            });
          });
        });
      });

      describe("when the tax ID is initially 12 digits in length", () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            taxId: "123456789123",
            legalStructureId: randomLegalStructure().id,
          }),
        });

        it("will save if tax ID does not change", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.click(screen.getByLabelText("Tax id"));
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual(userData);
          });
        });

        it("will not save if tax ID is less than 12 digits in length", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        it("will save if Tax ID changes to a different 12 digits", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "666666666666" } });
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual({
              ...userData,
              taxFilingData: {
                ...userData.taxFilingData,
                filings: [],
                state: undefined,
                registeredISO: undefined,
              },
              profileData: { ...userData.profileData, taxId: "666666666666" },
            });
          });
        });
      });

      describe("when the tax ID is initially 0  in length", () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            taxId: "",
            legalStructureId: randomLegalStructure().id,
          }),
        });

        it("will save if tax ID does not change", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.click(screen.getByLabelText("Tax id"));
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual(userData);
          });
        });

        it("will not save if tax ID is less than 12 digits in length", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(userDataWasNotUpdated()).toEqual(true);
          });
        });

        it("will save if Tax ID changes to 12 digits in length", async () => {
          renderPage({ userData });
          chooseTab("numbers");
          fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789123" } });
          fireEvent.blur(screen.getByLabelText("Tax id"));
          clickSave();
          await waitFor(() => {
            return expect(currentUserData()).toEqual({
              ...userData,
              taxFilingData: {
                ...userData.taxFilingData,
                filings: [],
                state: undefined,
                registeredISO: undefined,
              },
              profileData: { ...userData.profileData, taxId: "123456789123" },
            });
          });
        });
      });
    });

    it("prefills form from existing user data", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          businessName: "Applebees",
          industryId: "cosmetology",
          entityId: "1234567890",
          employerId: "123456789",
          taxId: "123456790",
          notes: "whats appppppp",
          municipality: generateMunicipality({
            displayName: "Newark",
          }),
        }),
      });

      renderPage({ userData });
      expect(getBusinessNameValue()).toEqual("Applebees");

      expect(getIndustryValue()).toEqual(LookupIndustryById("cosmetology").name);
      expect(getMunicipalityValue()).toEqual("Newark");
      chooseTab("numbers");
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123-456-790");
      chooseTab("notes");
      expect(getNotesValue()).toEqual("whats appppppp");
    });

    it("returns user to dashboard from un-saved changes modal", async () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      selectByText("Location", newark.displayName);
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalReturn));
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
      await waitFor(() => {
        return expect(() => {
          return currentUserData();
        }).toThrow();
      });
    });

    describe("tax related profile fields", () => {
      it("does not render the existing employees field and ownership field when register for taxes task is not complete", () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: "NEEDS_TO_REGISTER_FOR_TAXES",
          }),
        });
        renderPage({ userData: initialUserData });

        expect(screen.queryByLabelText("Existing employees")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Ownership")).not.toBeInTheDocument();
      });

      it("renders the existing employees field and ownership field when register for taxes task is complete", () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: "FORMED_AND_REGISTERED",
          }),
        });
        renderPage({ userData: initialUserData });

        expect(screen.getByLabelText("Existing employees")).toBeInTheDocument();
        expect(screen.getByLabelText("Ownership")).toBeInTheDocument();
      });

      it("prevents user from saving if existing employees field is empty", async () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            operatingPhase: "FORMED_AND_REGISTERED",
          }),
        });
        renderPage({ userData: initialUserData });

        fillText("Existing employees", "");
        fireEvent.blur(screen.queryByLabelText("Existing employees") as HTMLElement);
        clickSave();

        await waitFor(() => {
          expect(
            screen.getByText(Config.profileDefaults.fields.existingEmployees.default.errorTextRequired)
          ).toBeInTheDocument();
        });
      });
    });

    it("displays the sector dropdown when industry is generic", () => {
      renderPage({
        userData: generateUserData({
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
          userData: generateUserData({
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
        const header = screen.getByTestId("profile-header");
        expect(within(header).getByText(Config.profileDefaults.profileTabRefTitle)).toBeInTheDocument();
        expect(
          within(header).queryByText(Config.profileDefaults.profileTabInfoTitle)
        ).not.toBeInTheDocument();
      }
    );

    it.each(OperatingPhases.filter((it) => it.sectorRequired).map((it) => it.id))(
      "requires sector when %s phase",
      (phase) => {
        renderPage({
          userData: generateUserData({
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
        const header = screen.getByTestId("profile-header");
        expect(within(header).getByText(Config.profileDefaults.profileTabInfoTitle)).toBeInTheDocument();
        expect(within(header).queryByText(Config.profileDefaults.profileTabRefTitle)).not.toBeInTheDocument();
      }
    );

    it.each(industryIdsWithOutEssentialQuestion.filter((industry) => industry !== "generic"))(
      "saves userData when sector dropdown is removed from DOM when %s industry is selected",
      async (industry) => {
        const newIndustry = industry;

        const userData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            industryId: "generic",
            sectorId: undefined,
            operatingPhase: "UP_AND_RUNNING",
            legalStructureId: "limited-liability-company",
            ...emptyIndustrySpecificData,
          }),
          onboardingFormProgress: "COMPLETED",
        });
        renderPage({
          userData,
        });
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
        expect(currentUserData()).toEqual({
          ...userData,
          onboardingFormProgress: "COMPLETED",
          profileData: {
            ...userData.profileData,
            industryId: newIndustry,
            sectorId: LookupIndustryById(newIndustry).defaultSectorId,
            homeBasedBusiness: isHomeBasedBusinessApplicable(newIndustry) ? undefined : false,
            naicsCode: "",
          },
          taskProgress: {
            ...userData.taskProgress,
            [naicsCodeTaskId]: "NOT_STARTED",
          },
          taskItemChecklist: {},
        });
      }
    );

    it("prevents user from saving if in up-and-running and sector is not selected", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
          operatingPhase: "UP_AND_RUNNING",
          sectorId: undefined,
        }),
      });
      renderPage({ userData: userData });
      fireEvent.blur(screen.getByLabelText("Sector") as HTMLElement);

      clickSave();
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    describe("business name required", () => {
      const required: OperatingPhaseId[] = ["FORMED_AND_REGISTERED", "UP_AND_RUNNING"];
      const notRequired: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_FORM", "NEEDS_TO_REGISTER_FOR_TAXES"];

      for (const phase of required) {
        it(`prevents user from saving if business name in ${phase} phase`, async () => {
          const userData = generateUserData({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              operatingPhase: phase,
              businessName: "",
              legalStructureId: "limited-liability-company",
            }),
          });
          renderPage({ userData: userData });
          fireEvent.blur(screen.getByLabelText("Business name") as HTMLElement);

          clickSave();
          await waitFor(() => {
            expect(
              screen.getByText(Config.profileDefaults.fields.businessName.default.errorTextRequired)
            ).toBeInTheDocument();
          });
          expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
        });
      }

      for (const phase of notRequired) {
        it(`allows user to save with empty business name in ${phase} phase`, async () => {
          const userData = generateUserData({
            profileData: generateProfileData({
              businessPersona: "STARTING",
              operatingPhase: phase,
              businessName: "",
              legalStructureId: "limited-liability-company",
            }),
          });
          renderPage({ userData: userData });
          fireEvent.blur(screen.getByLabelText("Business name") as HTMLElement);

          clickSave();
          await waitFor(() => {
            expect(userDataUpdatedNTimes()).toEqual(1);
          });
          expect(screen.queryByTestId("snackbar-alert-ERROR")).not.toBeInTheDocument();
        });
      }
    });
  });

  describe("owning existing business", () => {
    it("user is able to save and is redirected to dashboard", async () => {
      const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "OWNING" }) });
      const inputFieldName = getBusinessProfileInputFieldName(userData);

      renderPage({
        userData: userData,
      });

      fillText(inputFieldName, "Cool Computers");
      clickSave();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true");
      });
    });

    it("prevents user from going back to dashboard if there are unsaved changes", () => {
      const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "OWNING" }) });
      const inputFieldName = getBusinessProfileInputFieldName(userData);

      renderPage({
        userData: userData,
      });
      fillText(inputFieldName, "Cool Computers");
      clickBack();
      expect(screen.getByText(Config.profileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", () => {
      const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "OWNING" }) });
      const inputFieldName = getBusinessProfileInputFieldName(userData);

      renderPage({
        userData: userData,
      });
      fillText(inputFieldName, "Cool Computers");
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalEscape));
      expect(screen.getByLabelText(inputFieldName)).toBeInTheDocument();
    });

    it("updates the user data on save", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          taxId: randomInt(9).toString(),
          businessPersona: "OWNING",
          industryId: "generic",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
        onboardingFormProgress: "COMPLETED",
      });
      const newark = generateMunicipality({ displayName: "Newark" });

      renderPage({ userData: userData, municipalities: [newark] });

      fillText("Business name", "Cool Computers");
      fillText("Date of formation", date.format("MM/YYYY"));
      selectByValue("Sector", "clean-energy");
      fillText("Existing employees", "123");
      selectByText("Location", newark.displayName);
      selectByValue("Ownership", "veteran-owned");
      selectByValue("Ownership", "woman-owned");
      chooseRadio("home-based-business-radio-true");
      chooseTab("numbers");
      fillText("Employer id", "02-3456780");
      fillText("Entity id", "0234567890");
      fillText("Tax id", "023456790");
      fillText("Tax id location", "123");
      fillText("Tax pin", "6666");
      chooseTab("notes");
      fillText("Notes", "whats appppppp");
      clickSave();

      await waitFor(() => {
        expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
      });
      expect(currentUserData()).toEqual({
        ...userData,
        onboardingFormProgress: "COMPLETED",
        taxFilingData: { ...userData.taxFilingData, state: undefined, filings: [], registeredISO: undefined },
        profileData: {
          ...userData.profileData,
          businessName: "Cool Computers",
          homeBasedBusiness: true,
          existingEmployees: "123",
          ownershipTypeIds: ["veteran-owned", "woman-owned"],
          municipality: newark,
          dateOfFormation,
          taxId: "023456790123",
          entityId: "0234567890",
          employerId: "023456780",
          notes: "whats appppppp",
          taxPin: "6666",
          sectorId: "clean-energy",
        },
      });
    });

    it("prefills form from existing user data", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          businessName: "Applebees",
          entityId: "1234567890",
          employerId: "123456789",
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
          dateOfFormation,
          taxId: "123456790",
          notes: "whats appppppp",
          municipality: generateMunicipality({
            displayName: "Newark",
          }),
          ownershipTypeIds: ["veteran-owned", "woman-owned"],
          homeBasedBusiness: false,
          existingEmployees: "123",
          taxPin: "6666",
          sectorId: "clean-energy",
          industryId: "generic",
        }),
      });

      const veteran = LookupOwnershipTypeById("veteran-owned").name;
      const woman = LookupOwnershipTypeById("woman-owned").name;

      renderPage({ userData });

      expect(getBusinessNameValue()).toEqual("Applebees");
      expect(getMunicipalityValue()).toEqual("Newark");
      expect(getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
      expect(screen.queryByLabelText("Ownership")).toHaveTextContent(`${veteran}, ${woman}`);
      expect(getRadioButtonFromFormControlLabel("home-based-business-radio-false")).toBeChecked();
      expect(getExistingEmployeesValue()).toEqual("123");
      expect(getDateOfFormation()).toEqual(date.format("MM/YYYY"));
      chooseTab("numbers");
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123-456-790");
      expect(getTaxPinValue()).toEqual("6666");
      chooseTab("notes");
      expect(getNotesValue()).toEqual("whats appppppp");
    });

    it("shows an error when tax pin input is not empty or is less than 4 digits", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "OWNING" }),
      });
      renderPage({ userData: userData });
      chooseTab("numbers");

      fillText("Tax pin", "");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      expect(
        screen.queryByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
      ).not.toBeInTheDocument();

      fillText("Tax pin", "123");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
        ).toBeInTheDocument();
      });

      fillText("Tax pin", "1234");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
        ).not.toBeInTheDocument();
      });
    });

    it("prevents user from saving if they partially entered Employer Id", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "OWNING" }),
      });
      renderPage({ userData: userData });
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

    it("prevents user from saving if sector is not selected", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: "UP_AND_RUNNING_OWNING",
          sectorId: "",
        }),
      });
      renderPage({ userData: userData });
      fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);

      clickSave();
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });

    it("returns user back to dashboard", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "OWNING" }),
      });
      renderPage({ userData: userData });

      clickBack();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
    });

    it("returns user to dashboard from un-saved changes modal", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "OWNING" }),
      });

      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: userData, municipalities: [newark] });
      selectByText("Location", newark.displayName);
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalReturn));
      await waitFor(() => {
        expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
      expect(() => {
        return currentUserData();
      }).toThrow();
    });

    it("displays business info tab", () => {
      renderPage({
        userData: generateUserData({
          profileData: generateProfileData({ businessPersona: "OWNING" }),
        }),
      });
      expect(screen.getByTestId("info")).toBeInTheDocument();
    });

    it("displays date of formation input for public filing businesses", () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: randomLegalStructure({ requiresPublicFiling: true }).id,
        }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      expect(screen.getByLabelText("Date of formation")).toBeInTheDocument();
    });

    it("does not display date of formation input for trade name businesses", () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: randomLegalStructure({ requiresPublicFiling: false }).id,
        }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
    });

    it("displays NAICS code when it exists", () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          naicsCode: "123456",
        }),
      });
      renderPage({ userData: initialUserData });
      chooseTab("numbers");
      expect(screen.getByTestId("profile-naics-code")).toBeInTheDocument();
      expect(screen.getByText("123456")).toBeInTheDocument();
    });

    it("doesn't display the NAICS code field when it doesn't exist", () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          naicsCode: "",
        }),
      });
      renderPage({ userData: initialUserData });
      chooseTab("numbers");
      expect(screen.queryByTestId("profile-naics-code")).not.toBeInTheDocument();
    });

    it("locks the location field if it is populated and tax filing state is SUCCESS", () => {
      renderPage({
        userData: generateUserData({
          profileData: generateProfileData({
            businessPersona: "OWNING",
            municipality: generateMunicipality({ displayName: "Trenton" }),
          }),
          taxFilingData: generateTaxFilingData({
            state: "SUCCESS",
          }),
        }),
      });
      expect(screen.getByText("Trenton")).toBeInTheDocument();
      expect(screen.getByTestId("locked-municipality")).toBeInTheDocument();
    });
  });

  describe("foreign business", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "FOREIGN" }),
      });
    });

    it("sends user back to dashboard", async () => {
      renderPage({ userData: userData });
      clickBack();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
      });
    });

    it("does not display the documents tab", () => {
      renderPage({ userData: userData });
      expect(screen.getAllByText(Config.profileDefaults.profileTabRefTitle).length).toBeGreaterThan(0);
      expect(screen.getAllByText(Config.profileDefaults.profileTabNoteTitle).length).toBeGreaterThan(0);
      expect(screen.getAllByText(Config.profileDefaults.profileTabInfoTitle).length).toBeGreaterThan(0);
      expect(screen.queryByText(Config.profileDefaults.profileTabDocsTitle)).not.toBeInTheDocument();
    });

    describe("Nexus Foreign Business", () => {
      const nexusForeignBusinessProfile = ({
        profileDataOverrides,
        formationDataOverrides,
        taxFilingDataOverrides,
      }: {
        profileDataOverrides?: Partial<ProfileData>;
        formationDataOverrides?: Partial<FormationData>;
        taxFilingDataOverrides?: Partial<TaxFilingData>;
      }): UserData => {
        return generateUserData({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            foreignBusinessTypeIds: ["NEXUS"],
            legalStructureId: "limited-liability-company",
            ...profileDataOverrides,
          }),
          formationData: generateFormationData({
            ...formationDataOverrides,
          }),
          taxFilingData: generateTaxFilingData({
            ...taxFilingDataOverrides,
          }),
        });
      };

      it("opens the default business information tab when clicked on profile", () => {
        renderPage({ userData: nexusForeignBusinessProfile({}) });
        expect(screen.getByTestId("info")).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.fields.industryId.default.header))
        ).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.fields.legalStructureId.default.header))
        ).toBeInTheDocument();
      });

      it("displays the out of state business name field", () => {
        renderPage({ userData: nexusForeignBusinessProfile({}) });
        expect(
          screen.getByText(Config.profileDefaults.fields.nexusBusinessName.default.outOfStateNameHeader)
        ).toBeInTheDocument();
      });

      it("displays Not Entered when the user hasn't entered a business name yet", () => {
        renderPage({
          userData: generateUserData({
            profileData: generateProfileData({
              businessPersona: "FOREIGN",
              foreignBusinessType: "NEXUS",
              legalStructureId: "limited-liability-company",
              businessName: "",
            }),
          }),
        });

        expect(
          screen.getByText(Config.profileDefaults.fields.nexusBusinessName.default.emptyBusinessPlaceHolder)
        ).toBeInTheDocument();
      });

      it("does not display out-of-state business name when SP/GP", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: { legalStructureId: "sole-proprietorship" },
          }),
        });

        expect(
          screen.queryByText(Config.profileDefaults.fields.nexusBusinessName.default.outOfStateNameHeader)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.profileDefaults.fields.nexusDbaName.default.header)
        ).not.toBeInTheDocument();
      });

      it("displays the user's business name if they have one", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({ profileDataOverrides: { businessName: "Test Business" } }),
        });
        expect(screen.getByText("Test Business")).toBeInTheDocument();
      });

      it("displays the user's dba name if they have one", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: {
              businessName: "Test Business",
              nexusDbaName: "DBA Name",
            },
          }),
        });
        expect(screen.getByText("Test Business")).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.fields.nexusDbaName.default.header))
        ).toBeInTheDocument();
      });

      it("doesn't display the user's dba name if they don't have one", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            profileDataOverrides: {
              businessName: "Test Business",
              nexusDbaName: "",
            },
          }),
        });
        expect(screen.getByText("Test Business")).toBeInTheDocument();
        expect(
          screen.queryByText(Config.profileDefaults.fields.nexusDbaName.default.header)
        ).not.toBeInTheDocument();
      });

      describe("location", () => {
        const renderWithLegalStructureAndPhase = (params: {
          legalStructureId: string;
          operatingPhase: OperatingPhaseId;
        }): void => {
          const newark = generateMunicipality({ displayName: "Newark" });
          const userData = generateUserData({
            profileData: generateProfileData({
              legalStructureId: params.legalStructureId,
              operatingPhase: params.operatingPhase,
              businessPersona: "FOREIGN",
              foreignBusinessType: "NEXUS",
              foreignBusinessTypeIds: ["NEXUS"],
              nexusLocationInNewJersey: true,
            }),
          });
          renderPage({ municipalities: [newark], userData });
        };

        it("locks when it is populated and tax filing state is SUCCESS", () => {
          renderPage({
            userData: generateUserData({
              profileData: generateProfileData({
                municipality: generateMunicipality({ displayName: "Trenton" }),
                legalStructureId: randomLegalStructure().id,
                businessPersona: "FOREIGN",
                foreignBusinessType: "NEXUS",
                foreignBusinessTypeIds: ["NEXUS"],
                nexusLocationInNewJersey: true,
              }),
              taxFilingData: generateTaxFilingData({
                state: "SUCCESS",
              }),
            }),
          });
          expect(screen.getByText("Trenton")).toBeInTheDocument();
          expect(screen.getByTestId("locked-municipality")).toBeInTheDocument();
        });

        describe("when location is optional", () => {
          describe("legalStructure is Public Filing and operating Phase is GUEST_MODE or NEEDS_TO_FORM", () => {
            const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
              (it) => {
                return it.id;
              }
            );
            const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_FORM"];

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

          describe("legalStructure is Trade Name and operating Phase is GUEST_MODE or NEEDS_TO_REGISTER", () => {
            const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
              return it.id;
            });
            const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE", "NEEDS_TO_REGISTER_FOR_TAXES"];

            for (const legalStructure of allTradeNameLegalStructures) {
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
        });

        describe("when location is required", () => {
          describe("legalStructure is Public Filing and operating Phase is NEEDS_TO_REGISTER_FOR_TAXES or FORMED_AND_REGISTERED", () => {
            const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
              (it) => {
                return it.id;
              }
            );
            const operatingPhases: OperatingPhaseId[] = [
              "NEEDS_TO_REGISTER_FOR_TAXES",
              "FORMED_AND_REGISTERED",
            ];
            for (const legalStructure of allPublicFilingLegalStructures) {
              for (const operatingPhase of operatingPhases) {
                it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                  renderWithLegalStructureAndPhase({
                    legalStructureId: legalStructure,
                    operatingPhase: operatingPhase,
                  });
                  removeLocationAndSave();
                  expectLocationNotSavedAndError();
                });
              }
            }
          });

          describe("legalStructure is Trade Name and operating Phase is FORMED_AND_REGISTERED", () => {
            const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
              return it.id;
            });
            for (const legalStructure of allTradeNameLegalStructures) {
              it(`prevents saving with empty location for ${legalStructure}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: "FORMED_AND_REGISTERED",
                });
                removeLocationAndSave();
                expectLocationNotSavedAndError();
              });
            }
          });
        });
      });

      describe("ProfileDateOfFormation", () => {
        it("displays the date of formation input field when date of formation has been submitted", () => {
          renderPage({
            userData: nexusForeignBusinessProfile({
              profileDataOverrides: {
                dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
              },
            }),
          });
          expect(
            screen.getByText(Config.profileDefaults.fields.dateOfFormation.default.header)
          ).toBeInTheDocument();
        });

        it("updates the date of formation to a future date", () => {
          renderPage({
            userData: nexusForeignBusinessProfile({
              profileDataOverrides: {
                dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
              },
            }),
          });

          fireEvent.change(screen.getByLabelText("Date of formation"), { target: { value: "09/2025" } });
          fireEvent.blur(screen.getByLabelText("Date of formation"));
          expect(
            screen.queryByText(Config.profileDefaults.fields.dateOfFormation.default.errorTextRequired)
          ).not.toBeInTheDocument();
        });

        it("does not display the date of formation input field when date of formation has not been submitted", () => {
          renderPage({
            userData: nexusForeignBusinessProfile({
              profileDataOverrides: {
                dateOfFormation: undefined,
              },
            }),
          });
          expect(
            screen.queryByText(Config.profileDefaults.fields.dateOfFormation.default.header)
          ).not.toBeInTheDocument();
        });

        it("locks the date of formation input field when the business has successfully formed", () => {
          renderPage({
            userData: nexusForeignBusinessProfile({
              profileDataOverrides: {
                dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
              },
              formationDataOverrides: {
                getFilingResponse: generateGetFilingResponse({ success: true }),
              },
            }),
          });
          expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
        });
      });
    });
  });

  it("shows the home-based question if applicable to industry", () => {
    renderPage({
      userData: generateUserData({
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
      userData: generateUserData({
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
      userData: generateUserData({
        profileData: generateProfileData({
          industryId: undefined,
          businessPersona: "STARTING",
        }),
      }),
    });
    expect(screen.getByLabelText("Home based business")).toBeInTheDocument();
  });

  it("does not show the home-based question if not applicable to industry", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: randomNonHomeBasedIndustry(),
        businessPersona: "STARTING",
      }),
    });
    renderPage({ userData });

    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
    ).not.toBeInTheDocument();
  });

  it("shows home-based business question with default description when applicable to industry", () => {
    const defaultDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return !phase.displayAltHomeBasedBusinessDescription;
    });

    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: randomElementFromArray(defaultDescOperatingPhases as OperatingPhase[]).id,
        nexusLocationInNewJersey: false,
      }),
    });

    renderPage({ userData });

    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
    ).not.toBeInTheDocument();
  });

  it("shows home-based business question with alt description when applicable to industry", () => {
    const altDescOperatingPhases = OperatingPhases.filter((phase: OperatingPhase) => {
      return phase.displayAltHomeBasedBusinessDescription;
    });
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: randomHomeBasedIndustry(),
        operatingPhase: randomElementFromArray(altDescOperatingPhases as OperatingPhase[]).id,
        nexusLocationInNewJersey: false,
      }),
    });

    renderPage({ userData });

    expect(
      screen.queryByText(Config.profileDefaults.fields.homeBasedBusiness.default.description)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.homeBasedBusiness.default.altDescription)
    ).toBeInTheDocument();
  });

  it("does not show the home-based question if FOREIGN locationInNewJersey=true, even if industry applicable", () => {
    renderPage({
      userData: generateUserData({
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessType: "NEXUS",
          nexusLocationInNewJersey: true,
          industryId: randomHomeBasedIndustry(),
        }),
      }),
    });
    expect(screen.queryByText("Home-based business")).not.toBeInTheDocument();
  });

  it("sends analytics when municipality entered for first time", async () => {
    const initialUserData = generateUserData({
      profileData: generateProfileData({
        municipality: undefined,
        legalStructureId: randomLegalStructure().id,
      }),
    });

    const newark = generateMunicipality({ displayName: "Newark" });
    renderPage({ userData: initialUserData, municipalities: [newark] });
    selectByText("Location", newark.displayName);
    clickSave();
    await waitFor(() => {
      return expect(currentUserData().profileData.municipality).toEqual(newark);
    });
    expect(
      mockAnalytics.event.profile_location_question.submit.location_entered_for_first_time
    ).toHaveBeenCalled();
  });

  it("does not send analytics when municipality already existed", async () => {
    const newark = generateMunicipality({ displayName: "Newark" });

    const initialUserData = generateUserData({
      profileData: generateProfileData({
        municipality: generateMunicipality({ displayName: "Jersey City" }),
        legalStructureId: randomLegalStructure().id,
      }),
    });

    renderPage({ userData: initialUserData, municipalities: [newark] });
    selectByText("Location", newark.displayName);
    clickSave();
    await waitFor(() => {
      return expect(currentUserData().profileData.municipality).toEqual(newark);
    });
    expect(
      mockAnalytics.event.profile_location_question.submit.location_entered_for_first_time
    ).not.toHaveBeenCalled();
  });

  it(`prevents Starting user from saving when petcare is selected as industry, but essential question is not answered`, async () => {
    const userData = generateUserData({
      onboardingFormProgress: "UNSTARTED",
      profileData: generateProfileData({
        businessPersona: "STARTING",
        industryId: "car-service",
        ...emptyIndustrySpecificData,
      }),
    });
    renderPage({ userData });
    clickSave();

    await waitFor(() => {
      expect(screen.getByText(Config.profileDefaults.essentialQuestionInlineText)).toBeInTheDocument();
    });
  });

  it("resets naicsCode task and data when the industry is changed and page is saved", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: "cosmetology",
        businessPersona: "STARTING",
        legalStructureId: randomLegalStructure().id,
      }),
      taskProgress: {
        [naicsCodeTaskId]: "COMPLETED",
      },
    });
    renderPage({ userData });
    selectByValue("Industry", "e-commerce");
    clickSave();

    await waitFor(() => {
      expect(currentUserData().taskProgress[naicsCodeTaskId]).toEqual("NOT_STARTED");
    });
    expect(currentUserData().profileData.naicsCode).toEqual("");
  });

  it("resets all task checkbox data data when the industry is changed and page is saved", async () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        industryId: "cosmetology",
        businessPersona: "STARTING",
        legalStructureId: randomLegalStructure().id,
      }),
      taskProgress: {
        [naicsCodeTaskId]: "COMPLETED",
      },
      taskItemChecklist: { key1: true },
    });
    renderPage({ userData });
    selectByValue("Industry", "e-commerce");
    clickSave();

    await waitFor(() => {
      expect(currentUserData().taskItemChecklist).toEqual({});
    });
  });

  describe("Essential Question", () => {
    it.each(industryIdsWithRequiredEssentialQuestion)(
      "prevents Starting user from saving when %s is selected as industry, but essential question is not answered",
      async (industryId) => {
        const userData = generateUserData({
          onboardingFormProgress: "UNSTARTED",
          profileData: generateProfileData({
            businessPersona: "STARTING",
            industryId: industryId,
            ...emptyIndustrySpecificData,
          }),
        });
        renderPage({ userData });
        clickSave();
        await waitFor(() => {
          expect(
            screen.getAllByText(Config.profileDefaults.essentialQuestionInlineText)[0]
          ).toBeInTheDocument();
        });
      }
    );

    it.each(industryIdsWithRequiredEssentialQuestion)(
      "prevents Foreign Nexus user from saving when %s is selected as industry, but essential question is not answered",
      async (industryId) => {
        const userData = generateUserData({
          onboardingFormProgress: "UNSTARTED",
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            industryId: industryId,
            foreignBusinessTypeIds: ["NEXUS"],
            ...emptyIndustrySpecificData,
          }),
        });
        renderPage({ userData });
        clickSave();
        await waitFor(() => {
          expect(
            screen.getAllByText(Config.profileDefaults.essentialQuestionInlineText)[0]
          ).toBeInTheDocument();
        });
      }
    );
  });

  describe("Numbers Section", () => {
    describe("tax id", () => {
      describe("disabled", () => {
        businessPersonas.map((businessPersona) => {
          it(`disables taxId for ${businessPersona} businessPersona when taxFiling Status is SUCCESS or PENDING`, () => {
            const userData = generateUserData({
              profileData: generateProfileData({
                taxId: "*******89123",
                encryptedTaxId: "some-encrypted-value",
                businessPersona,
                foreignBusinessTypeIds: businessPersona === "FOREIGN" ? ["NONE"] : undefined,
                legalStructureId: randomLegalStructure().id,
              }),
              taxFilingData: generateTaxFilingData({ state: randomInt() % 2 ? "SUCCESS" : "PENDING" }),
            });

            renderPage({ userData });
            chooseTab("numbers");
            expect(screen.queryByLabelText("Tax id")).not.toBeInTheDocument();
            expect(screen.getByTestId("disabled-taxid")).toHaveTextContent("***-***-*89/123");
            expect(screen.queryByTestId("tax-disclaimer")).not.toBeInTheDocument();
          });
        });
      });

      describe("disclaimer", () => {
        businessPersonas.map((businessPersona) => {
          const foreignBusinessTypes: ForeignBusinessType[] = [undefined];
          if (businessPersona === "FOREIGN") foreignBusinessTypes.push("NEXUS");
          foreignBusinessTypes.map((foreignBusinessType) => {
            it(`shows disclaimer for trade name legal structure for ${businessPersona} ${
              foreignBusinessType ?? ""
            } businessPersona`, () => {
              const userData = generateUserData({
                profileData: generateProfileData({
                  legalStructureId: randomTradeNameLegalStructure(),
                  businessPersona: businessPersona,
                  nexusLocationInNewJersey: true,
                  foreignBusinessType,
                  foreignBusinessTypeIds: ["NEXUS"],
                }),
              });
              renderPage({ userData });
              chooseTab("numbers");
              expect(screen.getByTestId("tax-disclaimer")).toHaveTextContent(
                markdownToText(Config.profileDefaults.fields.taxId.default.disclaimerMd)
              );
            });
          });
        });

        it("does not show disclaimer for public filing legal structure", () => {
          const userData = generateUserData({
            profileData: generateProfileData({
              legalStructureId: randomPublicFilingLegalStructure(),
            }),
          });
          renderPage({ userData });
          chooseTab("numbers");

          expect(screen.queryByTestId("tax-disclaimer")).not.toBeInTheDocument();
        });
      });
    });
  });

  describe("Document Section", () => {
    describe("if Poppy", () => {
      it("shows document section if user's legal structure requires public filing", () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "limited-liability-company",
          }),
        });
        renderPage({ userData });
        chooseTab("documents");
        expect(screen.getByTestId("profileContent-documents")).toBeInTheDocument();
      });

      it("removes document section if user's legal structure does not require public filing", () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "sole-proprietorship",
          }),
        });
        renderPage({ userData });
        expect(screen.queryByTestId("documents")).not.toBeInTheDocument();
        expect(screen.queryByTestId("profileContent-documents")).not.toBeInTheDocument();
      });

      it("shows placeholder text if there are no documents", () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({ success: true }),
          }),
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "limited-liability-company",
            documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" },
          }),
        });
        renderPage({ userData });
        chooseTab("documents");
        expect(
          screen.getByText(Config.profileDefaults.fields.documents.default.placeholder.split("[")[0], {
            exact: false,
          })
        ).toBeInTheDocument();
      });

      it("shows document links", () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({ success: true }),
          }),
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "limited-liability-company",
            documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol" },
          }),
        });
        renderPage({ userData });
        chooseTab("documents");
        expect(screen.queryByText("test12345")).not.toBeInTheDocument();
        expect(screen.getByText(Config.profileDefaults.formationDocFileTitle)).toBeInTheDocument();
        expect(screen.getByText(Config.profileDefaults.certificationDocFileTitle)).toBeInTheDocument();
        expect(screen.getByText(Config.profileDefaults.standingDocFileTitle)).toBeInTheDocument();
      });

      it("uses links from useDocuments hook", () => {
        setMockDocumentsResponse({
          formationDoc: "testForm.pdf",
          certifiedDoc: "testCert.pdf",
          standingDoc: "testStand.pdf",
        });
        const userData = generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({ success: true }),
          }),
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "limited-liability-company",
            documents: { certifiedDoc: "pz.zip", formationDoc: "whatever.pdf", standingDoc: "lol" },
          }),
        });
        renderPage({
          userData,
        });
        chooseTab("documents");

        expect(screen.getByText(Config.profileDefaults.formationDocFileTitle)).toHaveAttribute(
          "href",
          "testForm.pdf"
        );
        expect(screen.getByText(Config.profileDefaults.standingDocFileTitle)).toHaveAttribute(
          "href",
          "testStand.pdf"
        );
        expect(screen.getByText(Config.profileDefaults.certificationDocFileTitle)).toHaveAttribute(
          "href",
          "testCert.pdf"
        );
      });

      it("hides document links if they do not exist", () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({ success: true }),
          }),
          profileData: generateProfileData({
            businessPersona: "STARTING",
            legalStructureId: "limited-liability-company",
            documents: { certifiedDoc: "pp.zip", formationDoc: "whatever.pdf", standingDoc: "" },
          }),
        });

        renderPage({ userData });
        chooseTab("documents");

        expect(screen.getByText(Config.profileDefaults.formationDocFileTitle)).toBeInTheDocument();
        expect(screen.getByText(Config.profileDefaults.certificationDocFileTitle)).toBeInTheDocument();
        expect(screen.queryByText(Config.profileDefaults.standingDocFileTitle)).not.toBeInTheDocument();
      });
    });

    describe("if Oscar", () => {
      it("has no document section", () => {
        const userData = generateUserData({
          profileData: generateProfileData({
            businessPersona: "OWNING",
          }),
        });
        renderPage({ userData });
        expect(screen.queryByTestId("documents")).not.toBeInTheDocument();
      });
    });
  });

  describe("profile opportunities alert", () => {
    const ProfileConfig = Config.profileDefaults.fields;

    const phasesWhereAlertTrue = OperatingPhases.filter((it) => it.displayProfileOpportunityAlert).map(
      (it) => it.id
    );
    const phasesWhereAlertFalse = OperatingPhases.filter((it) => !it.displayProfileOpportunityAlert).map(
      (it) => it.id
    );

    it.each(phasesWhereAlertTrue)("displays alert for %s", (operatingPhase) => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase,
          dateOfFormation: undefined,
        }),
      });
      renderPage({ userData });

      expect(screen.getByTestId("opp-alert")).toBeInTheDocument();
    });

    it.each(phasesWhereAlertFalse)("does not display alert for %s", (operatingPhase) => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase,
          dateOfFormation: undefined,
        }),
      });
      renderPage({ userData });

      expect(screen.queryByTestId("opp-alert")).not.toBeInTheDocument();
    });

    it("only displays alert on info tab", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          dateOfFormation: undefined,
          legalStructureId: randomLegalStructure().id,
        }),
      });
      renderPage({ userData });
      expect(screen.getByTestId("opp-alert")).toBeInTheDocument();
      chooseTab("numbers");
      expect(screen.queryByTestId("opp-alert")).not.toBeInTheDocument();
    });

    it("lists each unanswered funding/certification question", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          dateOfFormation: undefined,
          existingEmployees: undefined,
          municipality: undefined,
          homeBasedBusiness: undefined,
          ownershipTypeIds: [],
        }),
      });
      renderPage({ userData });

      expect(screen.getByTestId("opp-alert")).toHaveTextContent(ProfileConfig.dateOfFormation.default.header);
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        ProfileConfig.existingEmployees.overrides.OWNING.header
      );
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(ProfileConfig.municipality.default.header);
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        ProfileConfig.homeBasedBusiness.default.header
      );
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        ProfileConfig.ownershipTypeIds.overrides.OWNING.header
      );
    });

    it("removes question from alert when it gets answered", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          dateOfFormation: undefined,
          existingEmployees: undefined,
        }),
      });
      renderPage({ userData });

      expect(screen.getByTestId("opp-alert")).toHaveTextContent(ProfileConfig.dateOfFormation.default.header);
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        ProfileConfig.existingEmployees.overrides.OWNING.header
      );

      fillText("Existing employees", "12");

      expect(screen.getByTestId("opp-alert")).toHaveTextContent(ProfileConfig.dateOfFormation.default.header);
      expect(screen.getByTestId("opp-alert")).not.toHaveTextContent(
        ProfileConfig.existingEmployees.overrides.OWNING.header
      );
    });

    it("does not display alert if all funding/certification questions are answered", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "UP_AND_RUNNING_OWNING",
          dateOfFormation: "2023-03-01",
          municipality: generateMunicipality({}),
          homeBasedBusiness: true,
          ownershipTypeIds: ["none"],
          existingEmployees: undefined,
        }),
      });
      renderPage({ userData });
      expect(screen.getByTestId("opp-alert")).toHaveTextContent(
        ProfileConfig.existingEmployees.overrides.OWNING.header
      );
      fillText("Existing employees", "12");
      expect(screen.queryByTestId("opp-alert")).not.toBeInTheDocument();
    });
  });

  describe("trade name field behavior", () => {
    it("displays trade name field as editable if starting a trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderPage({ userData });
      expect(screen.getByTestId("tradeName")).toBeInTheDocument();
    });

    it("displays trade name field for an existing trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderPage({ userData });
      expect(screen.getByTestId("tradeName")).toBeInTheDocument();
    });

    it("hides trade name field if starting a non trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
        }),
      });
      renderPage({ userData });
      expect(screen.queryByTestId("tradeName")).not.toBeInTheDocument();
    });

    it("hides trade name field for existing non trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: "limited-liability-company",
        }),
      });
      renderPage({ userData });
      expect(screen.queryByTestId("tradeName")).not.toBeInTheDocument();
    });

    it("displays tradeName as locked if user has accessed tax data", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
        }),
      });
      renderPage({ userData });
      expect(screen.getByText(Config.profileDefaults.fields.tradeName.default.header)).toBeInTheDocument();
      expect(screen.queryByTestId("tradeName")).not.toBeInTheDocument();
    });
  });

  describe("responsible owner name field behavior", () => {
    it("displays responsibleOwnerName field if starting a trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "general-partnership",
        }),
      });
      renderPage({ userData });
      expect(screen.getByTestId("responsibleOwnerName")).toBeInTheDocument();
    });

    it("displays responsibleOwnerName field for an existing trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: "general-partnership",
        }),
      });
      renderPage({ userData });
      expect(screen.getByTestId("responsibleOwnerName")).toBeInTheDocument();
    });

    it("hides responsibleOwnerName field if starting a non trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
        }),
      });
      renderPage({ userData });
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });

    it("hides responsibleOwnerName field for an existing non trade name business", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
        }),
      });
      renderPage({ userData });
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });

    it("displays responsibleOwnerName as locked if user has accessed tax data", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "sole-proprietorship",
        }),
        taxFilingData: generateTaxFilingData({
          state: "PENDING",
        }),
      });
      renderPage({ userData });
      expect(
        screen.getByText(Config.profileDefaults.fields.responsibleOwnerName.default.header)
      ).toBeInTheDocument();
      expect(screen.queryByTestId("responsibleOwnerName")).not.toBeInTheDocument();
    });
  });

  const fillText = (label: string, value: string): void => {
    fireEvent.change(screen.getByLabelText(label), { target: { value: value } });
    fireEvent.blur(screen.getByLabelText(label));
  };

  const selectByValue = (label: string, value: string): void => {
    expect(screen.getByLabelText(label)).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string): void => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText(value));
  };

  const clickSave = (): void => {
    fireEvent.click(screen.getAllByTestId("save")[0]);
  };

  const clickBack = (): void => {
    fireEvent.click(screen.getAllByTestId("back")[0]);
  };

  const getBusinessNameValue = (): string => {
    return (screen.queryByLabelText("Business name") as HTMLInputElement)?.value;
  };

  const getSectorIDValue = (): string => {
    return (screen.queryByLabelText("Sector") as HTMLInputElement)?.value;
  };

  const getEntityIdValue = (): string => {
    return (screen.queryByLabelText("Entity id") as HTMLInputElement)?.value;
  };

  const getDateOfFormation = (): string => {
    return (screen.queryByLabelText("Date of formation") as HTMLInputElement)?.value;
  };

  const getNotesValue = (): string => {
    return (screen.queryByLabelText("Notes") as HTMLInputElement)?.value;
  };

  const getTaxIdValue = (): string => {
    return (screen.queryByLabelText("Tax id") as HTMLInputElement)?.value;
  };

  const getEmployerIdValue = (): string => {
    return (screen.queryByLabelText("Employer id") as HTMLInputElement)?.value;
  };

  const getIndustryValue = (): string => {
    return (screen.queryByTestId("industryid") as HTMLInputElement)?.value;
  };

  const getMunicipalityValue = (): string => {
    return (screen.queryByTestId("municipality") as HTMLInputElement)?.value;
  };

  const getExistingEmployeesValue = (): string => {
    return (screen.getByLabelText("Existing employees") as HTMLInputElement).value;
  };

  const getTaxPinValue = (): string => {
    return (screen.getByLabelText("Tax pin") as HTMLInputElement).value;
  };

  const getRadioButtonFromFormControlLabel = (dataTestId: string): HTMLInputElement => {
    return within(screen.getByTestId(dataTestId) as HTMLInputElement).getByRole("radio");
  };

  const chooseRadio = (value: string): void => {
    fireEvent.click(screen.getByTestId(value));
  };

  const chooseTab = (value: ProfileTabs): void => {
    fireEvent.click(screen.getByTestId(value));
  };

  const removeLocationAndSave = (): void => {
    fillText("Location", "");
    fireEvent.blur(screen.getByLabelText("Location"));
    clickSave();
  };

  const expectLocationSavedAsUndefined = async (): Promise<void> => {
    await waitFor(() => {
      return expect(currentUserData().profileData.municipality).toEqual(undefined);
    });
  };

  const expectLocationNotSavedAndError = (): void => {
    expect(userDataWasNotUpdated()).toBe(true);
    expect(
      screen.getByText(Config.profileDefaults.fields.municipality.default.errorTextRequired)
    ).toBeInTheDocument();
    expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
  };

  const getBusinessProfileInputFieldName = (userData: UserData): string => {
    return LookupLegalStructureById(userData.profileData.legalStructureId).hasTradeName
      ? "Trade name"
      : "Business name";
  };
});
