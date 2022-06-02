import { SignUpToast } from "@/components/auth/SignUpToast";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { SidebarCardContent } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import RoadmapPage from "@/pages/roadmap";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generatePreferences,
  generateProfileData,
  generateSidebarCardContent,
  generateStep,
  generateTask,
  generateTaxFilingData,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockRoadmapResponse, useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  setMockUserDataResponse,
  useMockProfileData,
  useMockUserData,
  useMockUserDataError,
} from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import {
  getCurrentDate,
  LookupIndustryById,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
  RegistrationStatus,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("next/router");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();

const setMobileScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const createDisplayContent = (sidebar?: Record<string, SidebarCardContent>) => ({
  contentMd: "",
  sidebarDisplayContent: sidebar ?? { welcome: generateSidebarCardContent({}) },
});

describe("roadmap page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    useMockRouter({});
    setMobileScreen(false);
    jest.useFakeTimers();
  });

  const renderRoadmapPage = ({
    sidebarDisplayContent,
  }: {
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
  }) => {
    render(
      <ThemeProvider theme={createTheme()}>
        <RoadmapPage operateReferences={{}} displayContent={createDisplayContent(sidebarDisplayContent)} />
      </ThemeProvider>
    );
  };

  const renderPageWithUserData = (userData: UserData): { page: PageHelpers } => {
    render(
      <WithStatefulUserData initialUserData={userData}>
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage operateReferences={{}} displayContent={createDisplayContent()} />
        </ThemeProvider>
      </WithStatefulUserData>
    );
    const page = createPageHelpers();
    return { page };
  };

  const renderPageWithAuth = ({
    userData,
    isAuthenticated,
    sidebarDisplayContent,
    alertIsVisible,
    registrationAlertStatus,
    setAlertIsVisible,
  }: {
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
    sidebarDisplayContent?: Record<string, SidebarCardContent>;
    alertIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
    setAlertIsVisible?: jest.Mock<() => void>;
  }) => {
    setupStatefulUserDataContext();

    render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={userData || generateUserData({})}>
          <ThemeProvider theme={createTheme()}>
            <SignUpToast />
            <RoadmapPage
              operateReferences={{}}
              displayContent={createDisplayContent(sidebarDisplayContent)}
            />
          </ThemeProvider>
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { alertIsVisible: alertIsVisible ?? false, registrationAlertStatus, setAlertIsVisible }
      )
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    renderRoadmapPage({});
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderRoadmapPage({});
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows user data and loading spinner when user data loaded but not roadmap", () => {
    useMockProfileData({ businessName: "Some Cool Name" });
    setMockRoadmapResponse(undefined);
    renderRoadmapPage({});
    expect(screen.getByTestId("mini-profile-businessName")).toHaveTextContent("Some Cool Name");
    expect(screen.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("redirects to onboarding if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderRoadmapPage({});
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("shows toast alert when success query is true", () => {
    useMockProfileData({});
    useMockRouter({ isReady: true, query: { success: "true" } });
    renderRoadmapPage({});
    expect(screen.getByText(Config.profileDefaults.successTextHeader)).toBeInTheDocument();
  });

  it("directs guest-mode user to profile when profile edit button is clicked", () => {
    useMockProfileData({});
    const setModalIsVisible = jest.fn();
    render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage operateReferences={{}} displayContent={createDisplayContent()} />
        </ThemeProvider>,
        IsAuthenticated.FALSE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    fireEvent.click(screen.getByTestId("grey-callout-link"));
    expect(mockPush).toHaveBeenCalled();
    expect(setModalIsVisible).not.toHaveBeenCalled();
  });

  it("directs authenticated user to profile when profile edit button is clicked", () => {
    useMockProfileData({});
    const setModalIsVisible = jest.fn();
    render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage operateReferences={{}} displayContent={createDisplayContent()} />
        </ThemeProvider>,
        IsAuthenticated.TRUE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    fireEvent.click(screen.getByTestId("grey-callout-link"));
    expect(mockPush).toHaveBeenCalled();
    expect(setModalIsVisible).not.toHaveBeenCalled();
  });

  describe("mini-profile business information", () => {
    it("shows template with user name as header", () => {
      useMockUserData({
        profileData: generateProfileData({
          businessName: "some business",
          industryId: "restaurant",
          legalStructureId: "c-corporation",
        }),
        user: generateUser({ name: "Ada Lovelace" }),
      });
      renderRoadmapPage({});
      const expectedHeaderText = templateEval(Config.roadmapDefaults.roadmapTitleTemplateForUserName, {
        name: "Ada Lovelace",
      });
      expect(screen.getByText(expectedHeaderText)).toBeInTheDocument();
    });

    it("shows header placeholder if no user name present", () => {
      useMockUserData({
        profileData: generateProfileData({
          businessName: "",
          industryId: "restaurant",
          legalStructureId: "c-corporation",
        }),
        user: generateUser({ name: undefined }),
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-businessName")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
      expect(screen.getByText(Config.roadmapDefaults.roadmapTitleBusinessAndUserMissing)).toBeInTheDocument();
    });

    it("shows the human-readable industry from onboarding data", () => {
      useMockProfileData({ industryId: "home-contractor" });
      renderRoadmapPage({});
      const expectedValue = LookupIndustryById("home-contractor").name;
      expect(screen.getByTestId("mini-profile-industryId")).toHaveTextContent(expectedValue);
    });

    it("shows placeholder if no industry present", () => {
      useMockProfileData({
        industryId: "generic",
        legalStructureId: "c-corporation",
        municipality: generateMunicipality({}),
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-industryId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the human-readable legal structure from onboarding data", () => {
      useMockProfileData({ legalStructureId: "limited-liability-company" });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-legal-structure")).toHaveTextContent(
        "Limited Liability Company (LLC)"
      );
    });

    it("shows placeholder if no business structure present", () => {
      useMockProfileData({
        legalStructureId: undefined,
        industryId: "restaurant",
        municipality: generateMunicipality({}),
      });
      renderRoadmapPage({});
      expect(screen.getByText("Not set")).toBeInTheDocument();
      expect(screen.getByTestId("mini-profile-legal-structure")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the display municipality from onboarding data", () => {
      useMockProfileData({
        municipality: generateMunicipality({ displayName: "Franklin (Hunterdon County)" }),
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-location")).toHaveTextContent("Franklin (Hunterdon County)");
    });

    it("shows placeholder if no municipality present", () => {
      useMockProfileData({
        legalStructureId: "c-corporation",
        industryId: "restaurant",
        municipality: undefined,
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-location")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows entity id if present", () => {
      useMockProfileData({
        entityId: "1234567890",
        legalStructureId: "limited-liability-company",
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-entityId")).toHaveTextContent("1234567890");
    });

    it("does not show entity id for Trade Name legal structure even if present", () => {
      useMockProfileData({
        legalStructureId: "sole-proprietorship",
        entityId: "1234567890",
        businessPersona: "STARTING",
      });
      renderRoadmapPage({});
      expect(screen.queryByTestId("mini-profile-entityId")).not.toBeInTheDocument();
    });

    it("shows EIN with hyphen if present", () => {
      useMockProfileData({
        employerId: "123456789",
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-employerId")).toHaveTextContent("12-3456789");
    });

    it("shows new jersey tax id if present", () => {
      useMockProfileData({
        taxId: "123456789",
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-taxId")).toHaveTextContent("123456789");
    });

    it("shows notes if present", () => {
      useMockProfileData({
        notes: "some notes",
      });
      renderRoadmapPage({});
      expect(screen.getByTestId("mini-profile-notes")).toHaveTextContent("some notes");
    });

    it("shows placeholder for ein, nj tax id, notes", () => {
      useMockProfileData({
        entityId: undefined,
        employerId: undefined,
        taxId: undefined,
        notes: undefined,
      });
      renderRoadmapPage({});

      expect(screen.getByTestId("mini-profile-employerId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotEnteredText
      );
      expect(screen.getByTestId("mini-profile-taxId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotEnteredText
      );
      expect(screen.getByTestId("mini-profile-notes")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotEnteredText
      );
    });

    it("shows more/less for mobile", () => {
      setMobileScreen(true);
      useMockProfileData({
        businessName: "some name",
        legalStructureId: "c-corporation",
        industryId: "restaurant",
        municipality: generateMunicipality({ displayName: "Franklin" }),
        entityId: "123456790",
        employerId: "9876543210",
        taxId: "111111111",
        notes: "some notes",
      });
      renderRoadmapPage({});
      expect(screen.getByText("some name")).toBeInTheDocument();
      expect(screen.getByText("Corporation")).toBeInTheDocument();
      expect(screen.getByText("Franklin")).toBeInTheDocument();
      expect(screen.getByText("Restaurant")).toBeInTheDocument();
      expect(screen.queryByText("123456790")).not.toBeInTheDocument();
      expect(screen.queryByText("98-76543210")).not.toBeInTheDocument();
      expect(screen.queryByText("111111111")).not.toBeInTheDocument();
      expect(screen.queryByText("some notes")).not.toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.roadmapDefaults.greyBoxViewMoreText));
      expect(screen.getByText("some name")).toBeInTheDocument();
      expect(screen.getByText("Corporation")).toBeInTheDocument();
      expect(screen.getByText("Franklin")).toBeInTheDocument();
      expect(screen.getByText("Restaurant")).toBeInTheDocument();
      expect(screen.getByText("123456790")).toBeInTheDocument();
      expect(screen.getByText("98-76543210")).toBeInTheDocument();
      expect(screen.getByText("111111111")).toBeInTheDocument();
      expect(screen.getByText("some notes")).toBeInTheDocument();

      fireEvent.click(screen.getByText(Config.roadmapDefaults.greyBoxViewLessText));
      expect(screen.queryByText("123456790")).not.toBeInTheDocument();
      expect(screen.queryByText("98-76543210")).not.toBeInTheDocument();
      expect(screen.queryByText("111111111")).not.toBeInTheDocument();
      expect(screen.queryByText("some notes")).not.toBeInTheDocument();
    });

    it("shows business info box if error is CACHED_ONLY", () => {
      useMockUserDataError("CACHED_ONLY");
      renderRoadmapPage({});
      expect(screen.getByTestId("error-alert-CACHED_ONLY")).toBeInTheDocument();
    });

    it("does not show business info box if error is NO_DATA", () => {
      useMockUserDataError("NO_DATA");
      renderRoadmapPage({});
      expect(screen.queryByTestId("grey-callout-link")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-alert-NO_DATA")).toBeInTheDocument();
    });
  });

  it("shows steps and tasks from roadmap", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          timeEstimate: "1-2 weeks",
          tasks: [generateTask({ name: "task1" }), generateTask({ name: "task2" })],
        }),
        generateStep({
          name: "step2",
          tasks: [generateTask({ name: "task3" })],
        }),
      ],
    });

    renderRoadmapPage({});

    expect(screen.getByText("step1", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("1-2 weeks")).toBeInTheDocument();
    expect(screen.getByText("task1")).toBeInTheDocument();
    expect(screen.getByText("task2")).toBeInTheDocument();

    expect(screen.getByText("step2", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("task3")).toBeInTheDocument();
  });

  it("shows task progress tag", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          timeEstimate: "1-2 weeks",
          tasks: [generateTask({ id: "task1", name: "task1" }), generateTask({ id: "task2", name: "task2" })],
        }),
        generateStep({
          name: "step2",
          tasks: [generateTask({ id: "task3", name: "task3" })],
        }),
      ],
    });

    useMockUserData({
      taskProgress: {
        task1: "IN_PROGRESS",
        task2: "COMPLETED",
      },
    });

    renderRoadmapPage({});

    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Not started")).toBeInTheDocument();
  });

  it("displays each step under associated section", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          section: "PLAN",
        }),
        generateStep({
          name: "step2",
          section: "START",
        }),
        generateStep({
          name: "step3",
          section: "PLAN",
        }),
        generateStep({
          name: "step4",
          section: "START",
        }),
      ],
    });

    renderRoadmapPage({});

    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

    const sectionStart = screen.getByTestId("section-start");

    expect(within(sectionStart).queryByText("step1")).not.toBeInTheDocument();
    expect(within(sectionStart).queryByText("step3")).not.toBeInTheDocument();
    expect(within(sectionStart).getByText("step2")).toBeInTheDocument();
    expect(within(sectionStart).getByText("step4")).toBeInTheDocument();
  });

  it("displays sections based on userData preferences", () => {
    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["PLAN", "START"],
      }),
      taxFilingData: generateTaxFilingData({}),
    });

    renderRoadmapPage({});

    const sectionStart = screen.getByTestId("section-start");
    const sectionPlan = screen.getByTestId("section-plan");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
  });

  it("renders icon next to task status only if task is required", () => {
    useMockRoadmap({
      steps: [
        generateStep({
          section: "PLAN",
          tasks: [generateTask({ required: true }), generateTask({ required: false })],
        }),
      ],
    });

    renderRoadmapPage({});
    const sectionPlan = screen.getByTestId("section-plan");
    const allTasks = within(sectionPlan).getAllByRole("listitem");

    expect(allTasks.length).toEqual(2);

    expect(within(allTasks[0]).getByLabelText(Config.taskDefaults.requiredTagText)).toBeVisible();
    expect(within(allTasks[1]).queryByLabelText(Config.taskDefaults.requiredTagText)).not.toBeVisible();
  });

  it("renders tooltip when hovering over a required task's icon", async () => {
    useMockRoadmap({
      steps: [
        generateStep({
          name: "step1",
          tasks: [generateTask({ required: true })],
        }),
      ],
    });

    renderRoadmapPage({});
    await waitFor(() =>
      expect(screen.queryByText(Config.taskDefaults.requiredTagText)).not.toBeInTheDocument()
    );

    const requiredIcon = screen.getByLabelText(Config.taskDefaults.requiredTagText);
    fireEvent.mouseOver(requiredIcon);

    await waitFor(() => {
      expect(screen.getByText(Config.taskDefaults.requiredTagText)).toBeInTheDocument();
    });
    expect(screen.queryByText(Config.taskDefaults.requiredTagText)).toBeVisible();
  });

  describe("oscar graduation modal", () => {
    const openGraduationModal = (): void => {
      fireEvent.click(screen.getByText(Config.roadmapDefaults.graduationButtonText));
    };

    const submitGraduationModal = (): void => {
      fireEvent.click(screen.getByText(Config.roadmapDefaults.graduationModalContinueButtonText));
    };

    beforeEach(() => {
      setupStatefulUserDataContext();
      mockApi.postGetAnnualFilings.mockImplementation((request) => Promise.resolve(request));
    });

    it("switches user to oscar and sends to dashboard", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: undefined,
          sectorId: undefined,
          industryId: "generic",
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      const { page } = renderPageWithUserData(userData);

      const date = getCurrentDate().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");

      openGraduationModal();
      expect(screen.getByTestId("graduation-modal")).toBeInTheDocument();
      page.fillText("Business name", "A Clean Business");
      page.selectDate("Date of formation", date);
      page.selectByValue("Sector", "clean-energy");
      page.selectByValue("Ownership", "veteran-owned");
      page.fillText("Existing employees", "1234567");
      submitGraduationModal();

      await waitFor(() => {
        expect(currentUserData()).toEqual({
          ...userData,
          profileData: {
            ...userData.profileData,
            businessName: "A Clean Business",
            dateOfFormation,
            sectorId: "clean-energy",
            ownershipTypeIds: ["veteran-owned"],
            existingEmployees: "1234567",
            businessPersona: "OWNING",
          },
        });
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("pre-populates fields with data from profile", async () => {
      const date = getCurrentDate().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
          businessName: "A Test Business",
          dateOfFormation,
          sectorId: "clean-energy",
          industryId: "generic",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
        }),
      });

      const { page } = renderPageWithUserData(userData);

      openGraduationModal();
      expect((screen.getByLabelText("Business name") as HTMLInputElement).value).toEqual("A Test Business");
      expect(page.getDateOfFormationValue()).toEqual(date.format("MM/YYYY"));
      expect(page.getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
      expect(screen.queryByLabelText("Ownership")).toHaveTextContent(
        `${LookupOwnershipTypeById("veteran-owned").name}`
      );
      expect((screen.getByLabelText("Existing employees") as HTMLInputElement).value).toEqual("1234567");

      submitGraduationModal();

      await waitFor(() => {
        expect(currentUserData()).toEqual({
          ...userData,
          profileData: {
            ...userData.profileData,
            dateOfFormation,
            businessName: "A Test Business",
            sectorId: "clean-energy",
            ownershipTypeIds: ["veteran-owned"],
            existingEmployees: "1234567",
            businessPersona: "OWNING",
          },
        });
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("updates filing data", async () => {
      const taxData = generateTaxFilingData({});
      mockApi.postGetAnnualFilings.mockImplementation((userData) =>
        Promise.resolve({ ...userData, taxFilingData: { ...taxData, filings: [] } })
      );
      const date = getCurrentDate().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");
      const userData = generateUserData({
        taxFilingData: taxData,
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation,
          sectorId: "clean-energy",
          industryId: "generic",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
        }),
      });

      renderPageWithUserData(userData);
      openGraduationModal();
      submitGraduationModal();

      await waitFor(() => {
        expect(currentUserData()).toEqual({
          ...userData,
          taxFilingData: { ...taxData, filings: [] },
        });
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("shows sector for generic industry", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: "generic",
          businessPersona: "STARTING",
          sectorId: undefined,
        }),
      });

      renderPageWithUserData(userData);

      openGraduationModal();
      expect((screen.queryByLabelText("Sector") as HTMLInputElement)?.value).toEqual("Other Services");
    });

    it("does not show sector for non-generic industry", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: "restaurant",
          businessPersona: "STARTING",
          sectorId: undefined,
        }),
      });

      renderPageWithUserData(userData);

      openGraduationModal();
      expect(screen.queryByLabelText("Sector")).not.toBeInTheDocument();
    });

    it("fires validations when clicking submit", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: undefined,
          sectorId: undefined,
          industryId: undefined,
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      renderPageWithUserData(userData);
      openGraduationModal();
      submitGraduationModal();
      expect(userDataWasNotUpdated()).toEqual(true);
      expect(mockPush).not.toHaveBeenCalledWith("/dashboard");
      expect(screen.getByText(Config.profileDefaults.OWNING.dateOfFormation.errorText)).toBeInTheDocument();
      expect(screen.getByText(Config.profileDefaults.OWNING.sectorId.errorTextRequired)).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.OWNING.existingEmployees.errorTextRequired)
      ).toBeInTheDocument();
    });

    it("hides date of formation if legal structure does not require public filing", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "general-partnership",
        }),
      });

      renderPageWithUserData(userData);

      openGraduationModal();
      expect(screen.getByTestId("graduation-modal")).toBeInTheDocument();
      expect(screen.queryByLabelText("Date of formation")).not.toBeInTheDocument();
    });

    it("disables date of formation if formation getFiling success", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
        }),
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
      });

      const { page } = renderPageWithUserData(userData);
      openGraduationModal();
      expect(screen.getByLabelText("Date of formation")).toHaveAttribute("disabled");
      expect(page.getDateOfFormationValue()).toEqual(
        parseDateWithFormat(userData.formationData.formationFormData.businessStartDate, "YYYY-MM-DD").format(
          "MM/YYYY"
        )
      );
    });

    it("does not display businessName if formation getFiling success", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          businessName: "A Test Business 2",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
        }),
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
      });

      renderPageWithUserData(userData);
      openGraduationModal();
      expect(screen.queryByTestId("businessName")).toBeNull();
    });

    it("display businessName if formation is not set", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          businessName: "A Test Business 2",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
        }),
      });

      renderPageWithUserData(userData);
      openGraduationModal();
      expect(screen.getByTestId("businessName")).not.toBeNull();
      expect(screen.getByLabelText("Business name")).not.toBeNull();
    });
  });

  describe("sidebar", () => {
    it("renders welcome card", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["welcome"],
        }),
      });

      const sidebarDisplayContent = {
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
      };

      renderPageWithAuth({ userData, sidebarDisplayContent });
      await waitFor(() => {
        expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
      });
    });

    it("renders registration card when SignUpToast is closed", async () => {
      useMockRouter({ query: { fromOnboarding: "true" } });

      const sidebarDisplayContent = {
        "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
      };
      renderPageWithAuth({
        alertIsVisible: true,
        sidebarDisplayContent,
        isAuthenticated: IsAuthenticated.FALSE,
      });

      expect(screen.queryByText("NotRegisteredContent")).not.toBeInTheDocument();
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();

      fireEvent.click(within(screen.queryByTestId("self-reg-toast") as HTMLElement).getByLabelText("close"));

      await waitFor(() => {
        expect(screen.getByText("NotRegisteredContent")).toBeInTheDocument();
      });
      expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
    });

    it("renders registration card when SignUpToast is removed", async () => {
      const setAlertIsVisible = jest.fn();
      useMockRouter({});

      const sidebarDisplayContent = {
        "not-registered": generateSidebarCardContent({ contentMd: "NotRegisteredContent" }),
        welcome: generateSidebarCardContent({ contentMd: "WelcomeCardContent" }),
      };
      renderPageWithAuth({
        alertIsVisible: true,
        sidebarDisplayContent,
        isAuthenticated: IsAuthenticated.FALSE,
        setAlertIsVisible,
      });

      expect(screen.getByText("NotRegisteredContent")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("WelcomeCardContent")).toBeInTheDocument();
      });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("removes successful registration card when it's closed", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["successful-registration"],
        }),
      });

      const sidebarDisplayContent = {
        "successful-registration": generateSidebarCardContent({
          id: "successful-registration",
          contentMd: "SuccessContent",
          hasCloseButton: true,
        }),
      };

      renderPageWithAuth({
        userData,
        sidebarDisplayContent,
      });

      await waitFor(() => {
        expect(screen.getByText("SuccessContent")).toBeInTheDocument();
      });

      fireEvent.click(
        within(screen.getByTestId("successful-registration") as HTMLElement).getByLabelText("Close")
      );

      await waitFor(() => {
        expect(screen.queryByText("SuccessContent")).not.toBeInTheDocument();
      });
    });
  });

  describe("foreign business", () => {
    it("does not display graduation box for foreign business", () => {
      useMockProfileData({ businessPersona: "FOREIGN" });
      renderRoadmapPage({});
      expect(screen.queryByText(Config.roadmapDefaults.graduationButtonText)).not.toBeInTheDocument();
    });

    it("does not display mini-profile box for foreign business", () => {
      useMockProfileData({ businessPersona: "FOREIGN" });
      renderRoadmapPage({});
      expect(screen.queryByText(Config.roadmapDefaults.greyBoxHeaderText)).not.toBeInTheDocument();
    });
  });
});
