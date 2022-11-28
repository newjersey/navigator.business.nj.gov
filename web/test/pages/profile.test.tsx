/* eslint-disable jest/expect-expect */
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ProfileTabs } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getFlow, templateEval } from "@/lib/utils/helpers";
import Profile from "@/pages/profile";
import {
  allLegalStructuresOfType,
  generateFormationData,
  generateGetFilingResponse,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUser,
  generateUserData,
  randomHomeBasedIndustry,
  randomIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { markdownToText, randomElementFromArray, withAuthAlert, withRoadmap } from "@/test/helpers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  BusinessPersona,
  createEmptyUserData,
  defaultDateFormat,
  einTaskId,
  formationTaskId,
  generateMunicipality,
  getCurrentDate,
  LegalStructures,
  LookupIndustryById,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
  Municipality,
  OperatingPhase,
  OperatingPhaseId,
  OperatingPhases,
  ProfileData,
  randomInt,
  UserData,
} from "@businessnjgovnavigator/shared";
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

jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/roadmap/buildUserRoadmap", () => {
  return { buildUserRoadmap: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return { postGetAnnualFilings: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/utils/analytics", () => {
  return setupMockAnalytics();
});

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

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
  }) => {
    const genericTown =
      userData && userData.profileData.municipality
        ? userData.profileData.municipality
        : generateMunicipality({ displayName: "GenericTown" });
    render(
      withAuthAlert(
        <WithStatefulUserData
          initialUserData={
            userData || generateUserData({ profileData: generateProfileData({ municipality: genericTown }) })
          }
        >
          <Profile municipalities={municipalities ? [genericTown, ...municipalities] : [genericTown]} />
        </WithStatefulUserData>,
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

    function opensModalWhenEditingNonGuestModeProfileFields() {
      it("user is able to edit name and save", async () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        fillText("Business name", "Cool Computers");
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
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });
    });

    describe("disables fields when formation getFiling success", () => {
      const legalStructure = "limited-liability-company";
      const userData = {
        userData: generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({
              success: true,
            }),
          }),
          profileData: generateProfileData({
            dateOfFormation: "2020-01-01",
            businessPersona: "STARTING",
            legalStructureId: legalStructure,
            entityId: "some-id",
            businessName: "some-name",
          }),
        }),
      };

      it("disables businessName", () => {
        renderPage(userData);
        expect(screen.getByLabelText("Business name")).toBeDisabled();
      });

      it("disables entityID", () => {
        renderPage(userData);
        chooseTab("numbers");
        expect(screen.getByLabelText("Entity id")).toBeDisabled();
      });

      it("disables dateOfFormation", () => {
        renderPage(userData);
        chooseTab("numbers");
        expect(screen.getByLabelText("Date of formation")).toBeDisabled();
      });
    });

    describe("formation date", () => {
      it("does not display when empty", () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({ businessPersona: "STARTING", dateOfFormation: "" }),
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
        chooseTab("numbers");
        expect(getDateOfFormation()).toBe("01/2020");
      });

      it("does not save when formation date is empty", async () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({ businessPersona: "STARTING", dateOfFormation: "2020-01-01" }),
        });
        const newark = generateMunicipality({ displayName: "Newark" });
        renderPage({ userData: initialUserData, municipalities: [newark] });
        chooseTab("numbers");
        fillText("Date of formation", "");

        clickSave();

        await waitFor(() => {
          expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
        });
      });
    });

    it("displays business info tab", () => {
      renderPage({ userData });
      expect(screen.getByTestId("info")).toBeInTheDocument();
    });

    it("redirects user to dashboard with success query string on save", async () => {
      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith(`${ROUTES.dashboard}?success=true`);
      });
    });

    it("returns user to Business Formation after save using query string", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      useMockRoadmapTask({ id: formationTaskId, urlSlug: "some-formation-url" });

      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/some-formation-url");
      });
    });

    it("returns user to Business Formation on back using query string", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      useMockRoadmapTask({ id: formationTaskId, urlSlug: "some-formation-url" });

      renderPage({ userData });
      clickBack();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/some-formation-url");
      });
    });

    it("prevents user from going back to dashboard if there are unsaved changes", () => {
      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickBack();
      expect(screen.getByText(Config.profileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", () => {
      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalEscape));
      fillText("Business name", "Cool Computers2");
      expect(screen.getByLabelText("Business name")).toBeInTheDocument();
    });

    it("updates the user data on save", async () => {
      const emptyData = createEmptyUserData(generateUser({}));
      const initialUserData: UserData = {
        ...emptyData,
        profileData: {
          ...emptyData.profileData,
          taxId: "",
          businessPersona: "STARTING",
        },
      };
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      fillText("Business name", "Cool Computers");
      selectByText("Location", newark.displayName);
      selectByValue("Industry", "e-commerce");
      selectByValue("Legal structure", "c-corporation");
      chooseRadio("home-based-business-radio-true");

      chooseTab("numbers");
      fillText("Entity id", "0234567890");
      fillText("Tax id", "023456790123");
      fillText("Employer id", "02-3456780");
      chooseTab("notes");
      fillText("Notes", "whats appppppp");
      clickSave();

      await waitFor(() => {
        expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
      });
      expect(currentUserData()).toEqual({
        ...initialUserData,
        formProgress: "COMPLETED",
        profileData: {
          ...initialUserData.profileData,
          businessName: "Cool Computers",
          industryId: "e-commerce",
          sectorId: "retail-trade-and-ecommerce",
          homeBasedBusiness: true,
          legalStructureId: "c-corporation",
          municipality: newark,
          taxId: "023456790123",
          entityId: "0234567890",
          employerId: "023456780",
          notes: "whats appppppp",
        },
      });
    });

    it("updates tax filing data on save", async () => {
      const taxData = generateTaxFilingData({});
      mockApi.postGetAnnualFilings.mockImplementation((userData: UserData) => {
        return Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } });
      });
      const initialUserData = generateUserData({ taxFilingData: taxData });
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
      const emptyData = createEmptyUserData(generateUser({}));
      const initialUserData: UserData = {
        ...emptyData,
        profileData: {
          ...emptyData.profileData,
          businessPersona: "STARTING",
        },
      };
      renderPage({ userData: initialUserData, municipalities: [] });
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
      }) => {
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
        describe("legalStructure is Public Filing and operating Phase is any phase beyond NEEDS_TO_FORM", () => {
          const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
            (it) => {
              return it.id;
            }
          );
          const operatingPhases: OperatingPhaseId[] = [
            "NEEDS_TO_REGISTER_FOR_TAXES",
            "FORMED_AND_REGISTERED",
            "UP_AND_RUNNING",
          ];
          for (const legalStructure of allPublicFilingLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                expectLocationNotSavedAndError("STARTING");
              });
            }
          }
        });

        describe("legalStructure is Trade Name and operating Phase is any phase beyond NEEDS_TO_REGISTER", () => {
          const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
            return it.id;
          });
          const operatingPhases: OperatingPhaseId[] = ["FORMED_AND_REGISTERED", "UP_AND_RUNNING"];
          for (const legalStructure of allTradeNameLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                expectLocationNotSavedAndError("STARTING");
              });
            }
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
      expect(screen.queryByLabelText("Entity id")).not.toBeInTheDocument();
    });

    it("prevents user from saving if they partially entered Employer Id", async () => {
      renderPage({});
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
            screen.getByText(Config.profileDefaults[getFlow(userData.profileData)].taxId.errorTextRequired)
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
          legalStructureId: "c-corporation",
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

      expect(getLegalStructureValue()).toEqual("c-corporation");

      expect(getMunicipalityValue()).toEqual("Newark");
      chooseTab("numbers");
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123-456-790");
      chooseTab("notes");
      expect(getNotesValue()).toEqual("whats appppppp");
    });

    it("builds and sets roadmap on save", async () => {
      const profileData = generateProfileData({});
      const mockSetRoadmap = jest.fn();

      render(
        withRoadmap(
          <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
            <Profile municipalities={[]} />
          </WithStatefulUserData>,
          undefined,
          undefined,
          mockSetRoadmap
        )
      );
      clickSave();
      await waitFor(() => {
        return expect(currentUserData()).not.toBeFalsy();
      });
      await waitFor(() => {
        return expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
      });
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
            screen.getByText(Config.profileDefaults.STARTING.existingEmployees.errorTextRequired)
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

    it("saves userData when sector dropdown is removed from DOM", async () => {
      const newIndustry = randomIndustry(false).id;
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
          sectorId: undefined,
        }),
      });
      renderPage({
        userData,
      });
      fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData)].sectorId.errorTextRequired)
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
        formProgress: "COMPLETED",
        profileData: {
          ...userData.profileData,
          industryId: newIndustry,
          cannabisLicenseType: newIndustry == "cannabis" ? "CONDITIONAL" : undefined,
          sectorId: LookupIndustryById(newIndustry).defaultSectorId,
        },
      });
    });

    it("prevents user from saving if sector is not selected", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
          sectorId: undefined,
        }),
      });
      renderPage({ userData: userData });
      fireEvent.blur(screen.getByLabelText("Sector") as HTMLElement);

      clickSave();
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData)].sectorId.errorTextRequired)
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
    });
  });

  describe("owning existing business", () => {
    it("user is able to save and is redirected to dashboard", async () => {
      const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "OWNING" }) });

      renderPage({
        userData: userData,
      });

      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => {
        return expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true");
      });
    });

    it("prevents user from going back to dashboard if there are unsaved changes", () => {
      const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "OWNING" }) });

      renderPage({
        userData: userData,
      });
      fillText("Business name", "Cool Computers");
      clickBack();
      expect(screen.getByText(Config.profileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", () => {
      const userData = generateUserData({ profileData: generateProfileData({ businessPersona: "OWNING" }) });

      renderPage({
        userData: userData,
      });
      fillText("Business name", "Cool Computers");
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalEscape));
      expect(screen.getByLabelText("Business name")).toBeInTheDocument();
    });

    it("updates the user data on save", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          taxId: randomInt(9).toString(),
          businessPersona: "OWNING",
          industryId: "generic",
        }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });

      renderPage({ userData: userData, municipalities: [newark] });

      fillText("Business name", "Cool Computers");
      selectByValue("Sector", "clean-energy");
      fillText("Existing employees", "123");
      selectByText("Location", newark.displayName);
      selectByValue("Ownership", "veteran-owned");
      selectByValue("Ownership", "woman-owned");
      chooseRadio("home-based-business-radio-true");
      chooseTab("numbers");
      fillText("Employer id", "02-3456780");
      fillText("Entity id", "0234567890");
      fillText("Date of formation", date.format("MM/YYYY"));
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
        formProgress: "COMPLETED",
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
      chooseTab("numbers");
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123-456-790");
      expect(getDateOfFormation()).toEqual(date.format("MM/YYYY"));
      expect(getTaxPinValue()).toEqual("6666");
      chooseTab("notes");
      expect(getNotesValue()).toEqual("whats appppppp");
    });

    it("resets taxFiling data when taxId is changed", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          businessName: "Applebees",
          entityId: "1234567890",
          employerId: "123456789",
          dateOfFormation,
          taxId: "123456790888",
          notes: "whats appppppp",
          municipality: generateMunicipality({
            displayName: "Newark",
          }),
          ownershipTypeIds: ["veteran-owned", "woman-owned"],
          homeBasedBusiness: false,
          existingEmployees: "123",
          taxPin: "6666",
          sectorId: "clean-energy",
        }),
        taxFilingData: generateTaxFilingData({ state: "SUCCESS", filings: [generateTaxFiling({})] }),
      });

      renderPage({ userData });
      chooseTab("numbers");
      fillText("Tax id", "123456789123");
      clickSave();
      await waitFor(() => {
        expect(screen.getByTestId("snackbar-alert-SUCCESS")).toBeInTheDocument();
      });

      expect(currentUserData().taxFilingData).toEqual({
        ...userData.taxFilingData,
        state: undefined,
        filings: [],
        registeredISO: undefined,
      });
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
        screen.queryByText(Config.profileDefaults[getFlow(userData)].taxPin.errorTextRequired)
      ).not.toBeInTheDocument();

      fillText("Tax pin", "123");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData)].taxPin.errorTextRequired)
        ).toBeInTheDocument();
      });

      fillText("Tax pin", "1234");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults[getFlow(userData)].taxPin.errorTextRequired)
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
          sectorId: "",
        }),
      });
      renderPage({ userData: userData });
      fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);

      clickSave();
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData)].sectorId.errorTextRequired)
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

    it("builds and sets roadmap on save", async () => {
      const profileData = generateProfileData({ businessPersona: "OWNING" });
      const mockSetRoadmap = jest.fn();

      render(
        withRoadmap(
          <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
            <Profile municipalities={[]} />
          </WithStatefulUserData>,
          undefined,
          undefined,
          mockSetRoadmap
        )
      );
      clickSave();
      await waitFor(() => {
        expect(currentUserData()).not.toBeUndefined();
      });
      expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
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

    describe("location", () => {
      const renderWithLegalStructureAndPhase = (params: {
        legalStructureId: string;
        operatingPhase: OperatingPhaseId;
      }) => {
        const newark = generateMunicipality({ displayName: "Newark" });
        const userData = generateUserData({
          profileData: generateProfileData({
            legalStructureId: params.legalStructureId,
            operatingPhase: params.operatingPhase,
            businessPersona: "OWNING",
          }),
        });
        renderPage({ municipalities: [newark], userData });
      };

      describe("when location is required (always)", () => {
        describe("any legal structure and operating Phase is any OWNING phase", () => {
          const allLegalStructures = LegalStructures.map((it) => {
            return it.id;
          });
          const operatingPhases: OperatingPhaseId[] = ["GUEST_MODE_OWNING", "UP_AND_RUNNING_OWNING"];
          for (const legalStructure of allLegalStructures) {
            for (const operatingPhase of operatingPhases) {
              it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                renderWithLegalStructureAndPhase({
                  legalStructureId: legalStructure,
                  operatingPhase: operatingPhase,
                });
                removeLocationAndSave();
                expectLocationNotSavedAndError("OWNING");
              });
            }
          }
        });
      });
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

    it("displays only the numbers and notes tabs", () => {
      renderPage({ userData: userData });
      expect(screen.getAllByText(Config.profileDefaults.profileTabRefTitle).length).toBeGreaterThan(0);
      expect(screen.getAllByText(Config.profileDefaults.profileTabNoteTitle).length).toBeGreaterThan(0);
      expect(screen.queryByText(Config.profileDefaults.profileTabInfoTitle)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.profileDefaults.profileTabDocsTitle)).not.toBeInTheDocument();
    });

    it("defaults to numbers tab", () => {
      renderPage({ userData: userData });
      expect(
        screen.getByText(markdownToText(Config.profileDefaults.FOREIGN.taxId.header))
      ).toBeInTheDocument();
    });

    describe("Nexus Foreign Business", () => {
      const nexusForeignBusinessProfile = (overrides: Partial<ProfileData>): UserData => {
        return generateUserData({
          profileData: generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            legalStructureId: "limited-liability-company",
            ...overrides,
          }),
        });
      };

      it("opens the default business information tab when clicked on profile", () => {
        renderPage({ userData: nexusForeignBusinessProfile({}) });
        expect(screen.getByTestId("info")).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.FOREIGN.industryId.header))
        ).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.FOREIGN.legalStructureId.header))
        ).toBeInTheDocument();
      });

      it("displays the out of state business name field", () => {
        renderPage({ userData: nexusForeignBusinessProfile({}) });
        expect(
          screen.getByText(Config.profileDefaults.nexusBusinessName.outOfStateNameHeader)
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
          screen.getByText(Config.profileDefaults.nexusBusinessName.emptyBusinessPlaceHolder)
        ).toBeInTheDocument();
      });

      it("does not display out-of-state business name when SP/GP", () => {
        renderPage({ userData: nexusForeignBusinessProfile({ legalStructureId: "sole-proprietorship" }) });

        expect(
          screen.queryByText(Config.profileDefaults.nexusBusinessName.outOfStateNameHeader)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.profileDefaults.FOREIGN.nexusDbaName.header)
        ).not.toBeInTheDocument();
      });

      it("displays the user's business name if they have one", () => {
        renderPage({ userData: nexusForeignBusinessProfile({ businessName: "Test Business" }) });
        expect(screen.getByText("Test Business")).toBeInTheDocument();
      });

      it("displays the user's dba name if they have one", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            businessName: "Test Business",
            nexusDbaName: "DBA Name",
          }),
        });
        expect(screen.getByText("Test Business")).toBeInTheDocument();
        expect(
          screen.getByText(markdownToText(Config.profileDefaults.FOREIGN.nexusDbaName.header))
        ).toBeInTheDocument();
      });

      it("doesn't display the user's dba name if they don't have one", () => {
        renderPage({
          userData: nexusForeignBusinessProfile({
            businessName: "Test Business",
            nexusDbaName: "",
          }),
        });
        expect(screen.getByText("Test Business")).toBeInTheDocument();
        expect(
          screen.queryByText(Config.profileDefaults.FOREIGN.nexusDbaName.header)
        ).not.toBeInTheDocument();
      });

      describe("location", () => {
        const renderWithLegalStructureAndPhase = (params: {
          legalStructureId: string;
          operatingPhase: OperatingPhaseId;
        }) => {
          const newark = generateMunicipality({ displayName: "Newark" });
          const userData = generateUserData({
            profileData: generateProfileData({
              legalStructureId: params.legalStructureId,
              operatingPhase: params.operatingPhase,
              businessPersona: "FOREIGN",
              foreignBusinessType: "NEXUS",
              nexusLocationInNewJersey: true,
            }),
          });
          renderPage({ municipalities: [newark], userData });
        };

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
          describe("legalStructure is Public Filing and operating Phase is any phase beyond NEEDS_TO_FORM", () => {
            const allPublicFilingLegalStructures = allLegalStructuresOfType({ type: "publicFiling" }).map(
              (it) => {
                return it.id;
              }
            );
            const operatingPhases: OperatingPhaseId[] = [
              "NEEDS_TO_REGISTER_FOR_TAXES",
              "FORMED_AND_REGISTERED",
              "UP_AND_RUNNING",
            ];
            for (const legalStructure of allPublicFilingLegalStructures) {
              for (const operatingPhase of operatingPhases) {
                it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                  renderWithLegalStructureAndPhase({
                    legalStructureId: legalStructure,
                    operatingPhase: operatingPhase,
                  });
                  removeLocationAndSave();
                  expectLocationNotSavedAndError("FOREIGN");
                });
              }
            }
          });

          describe("legalStructure is Trade Name and operating Phase is any phase beyond NEEDS_TO_REGISTER", () => {
            const allTradeNameLegalStructures = allLegalStructuresOfType({ type: "tradeName" }).map((it) => {
              return it.id;
            });
            const operatingPhases: OperatingPhaseId[] = ["FORMED_AND_REGISTERED", "UP_AND_RUNNING"];
            for (const legalStructure of allTradeNameLegalStructures) {
              for (const operatingPhase of operatingPhases) {
                it(`prevents saving with empty location for ${legalStructure} in ${operatingPhase}`, async () => {
                  renderWithLegalStructureAndPhase({
                    legalStructureId: legalStructure,
                    operatingPhase: operatingPhase,
                  });
                  removeLocationAndSave();
                  expectLocationNotSavedAndError("FOREIGN");
                });
              }
            }
          });
        });
      });
    });
  });

  it("disables legal structure field if formation getFiling success", () => {
    const userData = generateUserData({
      profileData: generateProfileData({ businessPersona: "STARTING" }),
      formationData: generateFormationData({
        getFilingResponse: generateGetFilingResponse({
          success: true,
        }),
      }),
    });

    renderPage({ userData });
    expect((screen.queryByTestId("legal-structure") as HTMLInputElement)?.disabled).toEqual(true);
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
    expect(screen.getByText("Home-based business")).toBeInTheDocument();
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
    expect(screen.queryByText("Home-based business")).not.toBeInTheDocument();

    selectByValue("Industry", randomHomeBasedIndustry());
    expect(screen.getByText("Home-based business")).toBeInTheDocument();
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
    expect(screen.getByText("Home-based business")).toBeInTheDocument();
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
      screen.queryByText(Config.profileDefaults[getFlow(userData)].homeBasedBusiness.description)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults[getFlow(userData)].homeBasedBusiness.altDescription)
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
      screen.getByText(Config.profileDefaults[getFlow(userData)].homeBasedBusiness.description)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(Config.profileDefaults[getFlow(userData)].homeBasedBusiness.altDescription)
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
      screen.queryByText(Config.profileDefaults[getFlow(userData)].homeBasedBusiness.description)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults[getFlow(userData)].homeBasedBusiness.altDescription)
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

      it("disables document section if user's legal structure does not require public filing", () => {
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
    });

    describe("if Oscar", () => {
      it("shows document section if user has successfully completed business formation", () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({ success: true }),
          }),
          profileData: generateProfileData({
            businessPersona: "OWNING",
          }),
        });
        renderPage({ userData });
        chooseTab("documents");
        expect(screen.getByTestId("profileContent-documents")).toBeInTheDocument();
      });

      it("disables document section if user has not completed business formation", () => {
        const userData = generateUserData({
          formationData: generateFormationData({
            getFilingResponse: generateGetFilingResponse({ success: false }),
          }),
          profileData: generateProfileData({
            businessPersona: "OWNING",
          }),
        });
        renderPage({ userData });
        expect(screen.queryByTestId("documents")).not.toBeInTheDocument();
        expect(screen.queryByTestId("profileContent-documents")).not.toBeInTheDocument();
      });
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
        screen.getByText(Config.profileDefaults[getFlow(userData)].documents.placeholder.split("[")[0], {
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

  const fillText = (label: string, value: string) => {
    fireEvent.change(screen.getByLabelText(label), { target: { value: value } });
    fireEvent.blur(screen.getByLabelText(label));
  };

  const selectByValue = (label: string, value: string) => {
    fireEvent.mouseDown(screen.getByLabelText(label));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectByText = (label: string, value: string) => {
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

  const getLegalStructureValue = (): string => {
    return (screen.queryByTestId("legal-structure") as HTMLInputElement)?.value;
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

  const chooseRadio = (value: string) => {
    fireEvent.click(screen.getByTestId(value));
  };

  const chooseTab = (value: ProfileTabs) => {
    fireEvent.click(screen.getByTestId(value));
  };

  const removeLocationAndSave = () => {
    fillText("Location", "");
    fireEvent.blur(screen.getByLabelText("Location"));
    clickSave();
  };

  const expectLocationSavedAsUndefined = async () => {
    await waitFor(() => {
      return expect(currentUserData().profileData.municipality).toEqual(undefined);
    });
  };

  const expectLocationNotSavedAndError = (persona: Exclude<BusinessPersona, undefined>) => {
    expect(userDataWasNotUpdated()).toBe(true);
    expect(
      screen.getByText(Config.profileDefaults[persona].municipality.errorTextRequired)
    ).toBeInTheDocument();
    expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
  };
});
