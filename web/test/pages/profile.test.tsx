import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ProfileTabs } from "@/lib/types/types";
import { getFlow, templateEval } from "@/lib/utils/helpers";
import Profile from "@/pages/profile";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUser,
  generateUserData,
  randomHomeBasedIndustry,
  randomIndustry,
  randomNonHomeBasedIndustry,
} from "@/test/factories";
import { markdownToText, withAuthAlert, withRoadmap } from "@/test/helpers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import { useMockRoadmap, useMockRoadmapTask } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyUserData,
  einTaskId,
  formationTaskId,
  getCurrentDate,
  LookupIndustryById,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
  Municipality,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const date = getCurrentDate().subtract(1, "month").date(1);
const Config = getMergedConfig();

const dateOfFormation = date.format("YYYY-MM-DD");
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postGetAnnualFilings: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("profile", () => {
  let setModalIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setModalIsVisible = jest.fn();
    useMockRouter({});
    useMockRoadmap({});
    setupStatefulUserDataContext();
    useMockDocuments({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) => Promise.resolve(userData));
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
        { modalIsVisible: false, setModalIsVisible }
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
        expect(setModalIsVisible).toHaveBeenCalledWith(true);
      });
    });

    function opensModalWhenEditingNonGuestModeProfileFields() {
      it("user is able to edit name and save", async () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        fillText("Business name", "Cool Computers");
        clickSave();
        await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalled());
      });

      it("opens registration modal when user tries to change EIN", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Employer id"), { target: { value: "123456789" } });
        expect(setModalIsVisible).toHaveBeenCalledWith(true);
      });

      it("opens registration modal when user tries to change entity ID", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Entity id"), { target: { value: "123456789" } });
        expect(setModalIsVisible).toHaveBeenCalledWith(true);
      });

      it("opens registration modal when user tries to change NJ Tax ID", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("numbers");
        fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "123456789" } });
        expect(setModalIsVisible).toHaveBeenCalledWith(true);
      });

      it("opens registration modal when user tries to change Notes", () => {
        renderPage({ userData: initialUserData, isAuthenticated: IsAuthenticated.FALSE });
        chooseTab("notes");
        fireEvent.change(screen.getByLabelText("Notes"), { target: { value: "some note" } });
        expect(setModalIsVisible).toHaveBeenCalledWith(true);
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

    it("displays business info tab", () => {
      renderPage({ userData });
      expect(screen.getByTestId("info")).toBeInTheDocument();
    });

    it("redirects user to dashboard with success query string on save", async () => {
      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() =>
        expect(mockRouter.mockPush).toHaveBeenCalledWith(`${ROUTES.dashboard}?success=true`)
      );
    });

    it("returns user to Business Formation after save using query string", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      useMockRoadmapTask({ id: formationTaskId, urlSlug: "some-formation-url" });

      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/some-formation-url"));
    });

    it("returns user to Business Formation on back using query string", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      useMockRoadmapTask({ id: formationTaskId, urlSlug: "some-formation-url" });

      renderPage({ userData });
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/some-formation-url"));
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
      fillText("Tax id", "023456790");
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
          taxId: "023456790",
          entityId: "0234567890",
          employerId: "023456780",
          notes: "whats appppppp",
        },
      });
    });

    it("updates tax filing data on save", async () => {
      const taxData = generateTaxFilingData({});
      mockApi.postGetAnnualFilings.mockImplementation((userData: UserData) =>
        Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } })
      );
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

    describe("disables fields when formation getFiling success", () => {
      describe("starting a business", () => {
        const userData = {
          userData: generateUserData({
            formationData: generateFormationData({
              getFilingResponse: generateGetFilingResponse({
                success: true,
              }),
            }),
            profileData: generateProfileData({
              businessPersona: "STARTING",
              legalStructureId: "limited-liability-company",
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
      });

      describe("owning a business", () => {
        const userData = {
          userData: generateUserData({
            formationData: generateFormationData({
              getFilingResponse: generateGetFilingResponse({
                success: true,
              }),
            }),
            profileData: generateProfileData({
              businessPersona: "OWNING",
              legalStructureId: "limited-liability-company",
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
    });

    it("prevents user from saving if they have not selected a location", async () => {
      const newark = generateMunicipality({ displayName: "Newark" });
      const userData = generateUserData({});
      renderPage({ municipalities: [newark], userData });
      fillText("Location", "");
      fireEvent.blur(screen.getByLabelText("Location"));
      clickSave();
      expect(
        screen.getByText(Config.profileDefaults[getFlow(userData)].municipality.errorTextRequired)
      ).toBeInTheDocument();
      expect(screen.getByTestId("snackbar-alert-ERROR")).toBeInTheDocument();
      selectByText("Location", newark.displayName);
      await waitFor(() =>
        expect(
          screen.queryByText(Config.profileDefaults[getFlow(userData)].municipality.errorTextRequired)
        ).not.toBeInTheDocument()
      );
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
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard));
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
      await waitFor(() => expect(currentUserData()).not.toBeFalsy());
      await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(1));
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
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard));
      await waitFor(() => expect(() => currentUserData()).toThrow());
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

      it("is read only", () => {
        const initialUserData = generateUserData({
          profileData: generateProfileData({ businessPersona: "STARTING", dateOfFormation: "2020-02-01" }),
        });
        const newark = generateMunicipality({ displayName: "Newark" });
        renderPage({ userData: initialUserData, municipalities: [newark] });
        chooseTab("numbers");
        expect(screen.getByLabelText("Date of formation")).toBeDisabled();
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
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true"));
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
          businessPersona: "OWNING",
          industryId: undefined,
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
        taxFilingData: { ...userData.taxFilingData, state: undefined, filings: [], registered: false },
        profileData: {
          ...userData.profileData,
          businessName: "Cool Computers",
          homeBasedBusiness: true,
          existingEmployees: "123",
          ownershipTypeIds: ["veteran-owned", "woman-owned"],
          municipality: newark,
          dateOfFormation,
          taxId: "023456790",
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
        registered: false,
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
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard));
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
      expect(() => currentUserData()).toThrow();
    });

    it("displays business info tab", () => {
      renderPage({
        userData: generateUserData({
          profileData: generateProfileData({ businessPersona: "OWNING" }),
        }),
      });
      expect(screen.getByTestId("info")).toBeInTheDocument();
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
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.dashboard));
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
    });
  });

  it("disables business name field if formation getFiling success", () => {
    const userData = generateUserData({
      profileData: generateProfileData({ businessPersona: "OWNING" }),
      formationData: generateFormationData({
        getFilingResponse: generateGetFilingResponse({
          success: true,
        }),
      }),
    });

    renderPage({ userData });
    expect(screen.getByLabelText("Business name")).toBeDisabled();
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
    renderPage({
      userData: generateUserData({
        profileData: generateProfileData({
          industryId: randomNonHomeBasedIndustry(),
          businessPersona: "STARTING",
        }),
      }),
    });
    expect(screen.queryByText("Home-based business")).not.toBeInTheDocument();
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

  const getBusinessNameValue = (): string =>
    (screen.queryByLabelText("Business name") as HTMLInputElement)?.value;

  const getSectorIDValue = (): string => (screen.queryByLabelText("Sector") as HTMLInputElement)?.value;

  const getEntityIdValue = (): string => (screen.queryByLabelText("Entity id") as HTMLInputElement)?.value;

  const getDateOfFormation = (): string =>
    (screen.queryByLabelText("Date of formation") as HTMLInputElement)?.value;

  const getNotesValue = (): string => (screen.queryByLabelText("Notes") as HTMLInputElement)?.value;

  const getTaxIdValue = (): string => (screen.queryByLabelText("Tax id") as HTMLInputElement)?.value;

  const getEmployerIdValue = (): string =>
    (screen.queryByLabelText("Employer id") as HTMLInputElement)?.value;

  const getIndustryValue = (): string => (screen.queryByTestId("industryid") as HTMLInputElement)?.value;

  const getMunicipalityValue = (): string =>
    (screen.queryByTestId("municipality") as HTMLInputElement)?.value;

  const getLegalStructureValue = (): string =>
    (screen.queryByTestId("legal-structure") as HTMLInputElement)?.value;

  const getExistingEmployeesValue = (): string =>
    (screen.getByLabelText("Existing employees") as HTMLInputElement).value;

  const getTaxPinValue = (): string => (screen.getByLabelText("Tax pin") as HTMLInputElement).value;

  const getRadioButtonFromFormControlLabel = (dataTestId: string): HTMLInputElement =>
    within(screen.getByTestId(dataTestId) as HTMLInputElement).getByRole("radio");

  const chooseRadio = (value: string) => {
    fireEvent.click(screen.getByTestId(value));
  };

  const chooseTab = (value: ProfileTabs) => {
    fireEvent.click(screen.getByTestId(value));
  };
});
