import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { createEmptyLoadDisplayContent, LoadDisplayContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Profile, { ProfileTabs } from "@/pages/profile";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generateProfileData,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert, withRoadmap } from "@/test/helpers";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
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
import React from "react";

const date = getCurrentDate().subtract(1, "month").date(1);

const dateOfFormation = date.format("YYYY-MM-DD");
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router");
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postGetAnnualFilings: jest.fn(),
}));
describe("profile", () => {
  let setModalIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    setModalIsVisible = jest.fn();
    useMockRouter({});
    setupStatefulUserDataContext();
    useMockDocuments({});
    mockApi.postGetAnnualFilings.mockImplementation((userData) => Promise.resolve(userData));
  });

  const renderPage = ({
    municipalities,
    displayContent,
    userData,
    isAuthenticated,
  }: {
    municipalities?: Municipality[];
    displayContent?: LoadDisplayContent;
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
          <Profile
            displayContent={displayContent || createEmptyLoadDisplayContent()}
            municipalities={municipalities ? [genericTown, ...municipalities] : [genericTown]}
          />
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    render(
      <WithStatefulUserData initialUserData={undefined}>
        <Profile displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
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
            hasExistingBusiness: false,
            legalStructureId: "limited-liability-company",
          }),
        });
      });

      opensModalWhenEditingNonGuestModeProfileFields();
    });

    describe("when has existing business", () => {
      beforeEach(() => {
        initialUserData = generateUserData({
          profileData: generateProfileData({ hasExistingBusiness: true }),
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
    it("user is able to save and is redirected to roadmap", async () => {
      renderPage({});
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap?success=true"));
    });

    it("user is able to save and is redirected back to Business Formation", async () => {
      useMockRouter({ query: { path: "businessFormation" } });
      renderPage({});
      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/form-business-entity"));
    });

    it("user is able to go back to Business Formation", async () => {
      useMockRouter({ query: { path: "businessFormation" } });

      renderPage({});
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/form-business-entity"));
    });

    it("prevents user from going back to roadmap if there are unsaved changes", () => {
      renderPage({});
      fillText("Business name", "Cool Computers");
      clickBack();
      expect(screen.getByText(Config.profileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", () => {
      renderPage({});
      fillText("Business name", "Cool Computers");
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalEscape));
      fillText("Business name", "Cool Computers2");
    });

    it("updates the user data on save", async () => {
      const initialUserData = createEmptyUserData(generateUser({}));
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
              hasExistingBusiness: false,
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
              hasExistingBusiness: true,
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
      renderPage({ municipalities: [newark] });
      fillText("Location", "");
      fireEvent.blur(screen.getByLabelText("Location"));
      clickSave();
      expect(screen.getByText(Config.onboardingDefaults.errorTextRequiredMunicipality)).toBeInTheDocument();
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
      selectByText("Location", newark.displayName);
      await waitFor(() =>
        expect(
          screen.queryByText(Config.onboardingDefaults.errorTextRequiredMunicipality)
        ).not.toBeInTheDocument()
      );
    });

    it("entity-id field existing depends on legal structure", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          legalStructureId: "general-partnership",
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
      renderPage({});
      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
    });

    it("prefills form from existing user data", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
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
            <Profile displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
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
      const initialUserData = createEmptyUserData(generateUser({}));
      const newark = generateMunicipality({ displayName: "Newark" });
      renderPage({ userData: initialUserData, municipalities: [newark] });
      selectByText("Location", newark.displayName);
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalReturn));
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap"));
      await waitFor(() => expect(() => currentUserData()).toThrowError());
    });
  });

  describe("has existing business", () => {
    it("user is able to save and is redirected to dashboard", async () => {
      const userData = generateUserData({ profileData: generateProfileData({ hasExistingBusiness: true }) });

      renderPage({
        userData: userData,
      });

      fillText("Business name", "Cool Computers");
      clickSave();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard?success=true"));
    });

    it("prevents user from going back to dashboard if there are unsaved changes", () => {
      const userData = generateUserData({ profileData: generateProfileData({ hasExistingBusiness: true }) });

      renderPage({
        userData: userData,
      });
      fillText("Business name", "Cool Computers");
      clickBack();
      expect(screen.getByText(Config.profileDefaults.escapeModalReturn)).toBeInTheDocument();
    });

    it("returns user to profile page from un-saved changes modal", () => {
      const userData = generateUserData({ profileData: generateProfileData({ hasExistingBusiness: true }) });

      renderPage({
        userData: userData,
      });
      fillText("Business name", "Cool Computers");
      clickBack();
      fireEvent.click(screen.getByText(Config.profileDefaults.escapeModalEscape));
      fillText("Business name", "Cool Computers2");
    });

    it("updates the user data on save", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true, industryId: undefined }),
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
          hasExistingBusiness: true,
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
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });
      renderPage({ userData: userData });
      chooseTab("numbers");

      fillText("Tax pin", "");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      expect(screen.queryByText(Config.profileDefaults.taxPinErrorText)).not.toBeInTheDocument();

      fillText("Tax pin", "123");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(screen.getByText(Config.profileDefaults.taxPinErrorText)).toBeInTheDocument();
      });

      fillText("Tax pin", "1234");
      fireEvent.blur(screen.getByLabelText("Tax pin"));
      await waitFor(() => {
        expect(screen.queryByText(Config.profileDefaults.taxPinErrorText)).not.toBeInTheDocument();
      });
    });

    it("prevents user from saving if they partially entered Employer Id", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
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
        profileData: generateProfileData({ hasExistingBusiness: true, sectorId: "" }),
      });
      renderPage({ userData: userData });
      fireEvent.blur(screen.queryByLabelText("Sector") as HTMLElement);

      clickSave();
      await waitFor(() => {
        expect(screen.getByText(Config.onboardingDefaults.errorTextRequiredSector)).toBeInTheDocument();
      });
      expect(screen.getByTestId("toast-alert-ERROR")).toBeInTheDocument();
    });

    it("user is able to go back to dashboard", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
      });
      renderPage({ userData: userData });

      clickBack();
      await waitFor(() => expect(mockRouter.mockPush).toHaveBeenCalledWith("/dashboard"));
    });

    it("builds and sets roadmap on save", async () => {
      const profileData = generateProfileData({ hasExistingBusiness: true });
      const mockSetRoadmap = jest.fn();

      render(
        withRoadmap(
          <WithStatefulUserData initialUserData={generateUserData({ profileData: profileData })}>
            <Profile displayContent={createEmptyLoadDisplayContent()} municipalities={[]} />
          </WithStatefulUserData>,
          undefined,
          undefined,
          mockSetRoadmap
        )
      );
      clickSave();
      await waitFor(() => {
        expect(currentUserData());
      });
      expect(mockSetRoadmap).toHaveBeenCalledTimes(1);
    });

    it("returns user to dashboard from un-saved changes modal", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({ hasExistingBusiness: true }),
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

  it("disables business name field if formation getFiling success", () => {
    const userData = generateUserData({
      profileData: generateProfileData({ hasExistingBusiness: true }),
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
      profileData: generateProfileData({ hasExistingBusiness: false }),
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
            hasExistingBusiness: false,
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
            hasExistingBusiness: false,
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
            hasExistingBusiness: true,
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
            hasExistingBusiness: true,
          }),
        });
        renderPage({ userData });
        expect(screen.queryByTestId("documents")).not.toBeInTheDocument();
        expect(screen.queryByTestId("profileContent-documents")).not.toBeInTheDocument();
      });
    });

    it("shows placeholder text if there are no documents", () => {
      const content = createEmptyLoadDisplayContent();
      const userData = generateUserData({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" },
        }),
      });
      renderPage({
        userData,
        displayContent: {
          ...content,
          PROFILE: { ...content.PROFILE, documents: { contentMd: "", placeholder: "test12345" } },
        },
      });
      chooseTab("documents");
      expect(screen.getByText("test12345")).toBeInTheDocument();
    });

    it("shows document links", () => {
      const content = createEmptyLoadDisplayContent();
      const userData = generateUserData({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol" },
        }),
      });
      renderPage({
        userData,
        displayContent: {
          ...content,
          PROFILE: { ...content.PROFILE, documents: { contentMd: "", placeholder: "test12345" } },
        },
      });
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
          hasExistingBusiness: false,
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
      const content = createEmptyLoadDisplayContent();
      const userData = generateUserData({
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({ success: true }),
        }),
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-company",
          documents: { certifiedDoc: "pp.zip", formationDoc: "whatever.pdf", standingDoc: "" },
        }),
      });

      renderPage({
        userData,
        displayContent: {
          ...content,
          PROFILE: { ...content.PROFILE, documents: { contentMd: "zpiasd", placeholder: "test12345" } },
        },
      });
      chooseTab("documents");

      expect(screen.queryByText("test12345")).not.toBeInTheDocument();
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
