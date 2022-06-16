import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ProfileTabs } from "@/lib/types/types";
import { getFlow, templateEval } from "@/lib/utils/helpers";
import Profile from "@/pages/profile";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
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
  getCurrentDate,
  LookupIndustryById,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
  Municipality,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const date = getCurrentDate().subtract(1, "month").date(1);
const Config = getMergedConfig();

const dateOfFormation = date.format("YYYY-MM-DD");
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/auth/useAuthProtectedPage");
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

    it("redirects user to roadmap with success query string on save", async () => {
      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap?success=true"));
    });

    it("returns user to Business Formation after save using query string", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      useMockRoadmapTask({ id: "form-business-entity", urlSlug: "some-formation-url" });

      renderPage({ userData });
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/some-formation-url"));
    });

    it("returns user to Business Formation on back using query string", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      useMockRoadmapTask({ id: "form-business-entity", urlSlug: "some-formation-url" });

      renderPage({ userData });
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/some-formation-url"));
    });

    it("prevents user from going back to roadmap if there are unsaved changes", () => {
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
      chooseRadio("home-based-business-true");

      chooseTab("numbers");
      fillText("Entity id", "0234567890");
      fillText("Tax id", "023456790");
      fillText("Employer id", "02-3456780");
      chooseTab("notes");
      fillText("Notes", "whats appppppp");
      clickSave();

      await waitFor(() => {
        expect(screen.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument();
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
        expect(screen.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument();
      });
      expect(currentUserData()).toEqual({
        ...initialUserData,
        taxFilingData: { ...taxData, filings: [] },
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
          expect(screen.getByLabelText("Business name")).toHaveAttribute("disabled");
        });

        it("disables entityID", () => {
          renderPage(userData);
          chooseTab("numbers");
          expect(screen.getByLabelText("Entity id")).toHaveAttribute("disabled");
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
          expect(screen.getByLabelText("Business name")).toHaveAttribute("disabled");
        });

        it("disables entityID", () => {
          renderPage(userData);
          chooseTab("numbers");
          expect(screen.getByLabelText("Entity id")).toHaveAttribute("disabled");
        });

        it("disables dateOfFormation", () => {
          renderPage(userData);
          chooseTab("numbers");
          expect(screen.getByLabelText("Date of formation")).toHaveAttribute("disabled");
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
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
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
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("user is able to go back to roadmap", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });
      renderPage({ userData });
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
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
      expect(getTaxIdValue()).toEqual("123456790");
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
      await waitFor(() => expect(currentUserData()));
      await waitFor(() => expect(mockSetRoadmap).toHaveBeenCalledTimes(1));
    });

    it("returns user to roadmap from un-saved changes modal", async () => {
      const initialUserData = generateUserData({
        profileData: generateProfileData({ businessPersona: "STARTING" }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      selectByText("Location", newark.displayName);
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalReturn));
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
      await waitFor(() => expect(() => currentUserData()).toThrowError());
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
        profileData: generateProfileData({ businessPersona: "OWNING", industryId: undefined }),
      });
      const newark = generateMunicipality({ displayName: "Newark" });

      renderPage({ userData: userData, municipalities: [newark] });

      fillText("Business name", "Cool Computers");
      selectByValue("Sector", "clean-energy");
      fillText("Existing employees", "123");
      selectByText("Location", newark.displayName);
      selectByValue("Ownership", "veteran-owned");
      selectByValue("Ownership", "woman-owned");
      chooseRadio("home-based-business-true");
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
        expect(screen.getByTestId("toast-alert-SUCCESS")).toBeInTheDocument();
      });
      expect(currentUserData()).toEqual({
        ...userData,
        formProgress: "COMPLETED",
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
        }),
      });

      const veteran = LookupOwnershipTypeById("veteran-owned").name;
      const woman = LookupOwnershipTypeById("woman-owned").name;

      renderPage({ userData });

      expect(getBusinessNameValue()).toEqual("Applebees");
      expect(getMunicipalityValue()).toEqual("Newark");
      expect(getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
      expect(screen.queryByLabelText("Ownership")).toHaveTextContent(`${veteran}, ${woman}`);
      expect(getRadioButtonFromFormControlLabel("home-based-business-false")).toBeChecked();
      expect(getExistingEmployeesValue()).toEqual("123");
      chooseTab("numbers");
      expect(getEmployerIdValue()).toEqual("12-3456789");
      expect(getEntityIdValue()).toEqual("1234567890");
      expect(getTaxIdValue()).toEqual("123456790");
      expect(getDateOfFormation()).toEqual(date.format("MM/YYYY"));
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
        screen.queryByText(Config.profileDefaults[getFlow(userData)].taxPin.errorText)
      ).not.toBeInTheDocument();

      fillText("Tax pin", "123");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData)].taxPin.errorText)
        ).toBeInTheDocument();
      });

      fillText("Tax pin", "1234");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(
          screen.queryByText(Config.profileDefaults[getFlow(userData)].taxPin.errorText)
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
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("prevents user from saving if sector is not selected", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "OWNING", sectorId: "" }),
      });
      renderPage({ userData: userData });
      fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);

      clickSave();
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults[getFlow(userData)].sectorId.errorTextRequired)
        ).toBeInTheDocument();
      });
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("returns user back to dashboard", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "OWNING" }),
      });
      renderPage({ userData: userData });

      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard"));
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
        expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard");
      });
      expect(() => currentUserData()).toThrowError();
    });
  });

  describe("foreign business", () => {
    let userData: UserData;

    beforeEach(() => {
      userData = generateUserData({
        profileData: generateProfileData({ businessPersona: "FOREIGN" }),
      });
    });

    it("sends user back to roadmap", async () => {
      renderPage({ userData: userData });
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
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
    expect(screen.getByLabelText("Business name")).toHaveAttribute("disabled");
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

      expect(screen.getByText(Config.profileDefaults.formationDocFileTitle).getAttribute("href")).toEqual(
        "testForm.pdf"
      );
      expect(screen.getByText(Config.profileDefaults.standingDocFileTitle).getAttribute("href")).toEqual(
        "testStand.pdf"
      );
      expect(screen.getByText(Config.profileDefaults.certificationDocFileTitle).getAttribute("href")).toEqual(
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
