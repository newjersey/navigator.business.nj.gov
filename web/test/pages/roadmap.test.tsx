import { SignUpToast } from "@/components/auth/SignUpToast";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  createEmptyLoadDisplayContent,
  createEmptySideBarDisplayContent,
  RoadmapSideBarContent,
} from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import RoadmapPage from "@/pages/roadmap";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generatePreferences,
  generateProfileData,
  generateRoadmapSidebarCard,
  generateSideBarContent,
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
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
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
import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import React from "react";

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

const setMobileScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const emptyDisplayContent = {
  contentMd: "",
};

describe("roadmap page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    useMockRouter({});
    setMobileScreen(false);
  });

  const renderRoadmapPage = ({
    sideBarDisplayContent,
  }: {
    sideBarDisplayContent?: RoadmapSideBarContent;
  }): RenderResult => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <RoadmapPage
          operateReferences={{}}
          displayContent={emptyDisplayContent}
          profileDisplayContent={createEmptyLoadDisplayContent()}
          sideBarDisplayContent={
            sideBarDisplayContent ? sideBarDisplayContent : createEmptySideBarDisplayContent()
          }
        />
      </ThemeProvider>
    );
  };

  const renderPageWithAuth = ({
    userData,
    isAuthenticated,
    sideBarDisplayContent,
    alertIsVisible,
    registrationAlertStatus,
  }: {
    userData?: UserData;
    isAuthenticated?: IsAuthenticated;
    sideBarDisplayContent?: RoadmapSideBarContent;
    alertIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
  }): RenderResult => {
    setupStatefulUserDataContext();

    return render(
      withAuthAlert(
        <WithStatefulUserData initialUserData={userData || generateUserData({})}>
          <ThemeProvider theme={createTheme()}>
            <SignUpToast />
            <RoadmapPage
              operateReferences={{}}
              displayContent={emptyDisplayContent}
              profileDisplayContent={createEmptyLoadDisplayContent()}
              sideBarDisplayContent={
                sideBarDisplayContent ? sideBarDisplayContent : createEmptySideBarDisplayContent()
              }
            />
          </ThemeProvider>
        </WithStatefulUserData>,
        isAuthenticated ?? IsAuthenticated.TRUE,
        { alertIsVisible: alertIsVisible ?? false, registrationAlertStatus }
      )
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    const subject = renderRoadmapPage({});
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    const subject = renderRoadmapPage({});
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("shows user data and loading spinner when user data loaded but not roadmap", () => {
    useMockProfileData({ businessName: "Some Cool Name" });
    setMockRoadmapResponse(undefined);
    const subject = renderRoadmapPage({});
    expect(subject.getByTestId("mini-profile-businessName")).toHaveTextContent("Some Cool Name");
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("redirects to onboarding if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderRoadmapPage({});
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("shows toast alert when success query is true", async () => {
    useMockProfileData({});
    useMockRouter({ isReady: true, query: { success: "true" } });
    const subject = renderRoadmapPage({});
    await waitFor(() =>
      expect(subject.getByText(Config.profileDefaults.successTextHeader)).toBeInTheDocument()
    );
  });

  it("directs guest-mode user to profile when profile edit button is clicked", async () => {
    useMockProfileData({});
    const setModalIsVisible = jest.fn();
    const subject = render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage
            operateReferences={{}}
            displayContent={emptyDisplayContent}
            profileDisplayContent={createEmptyLoadDisplayContent()}
            sideBarDisplayContent={createEmptySideBarDisplayContent()}
          />
        </ThemeProvider>,
        IsAuthenticated.FALSE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    fireEvent.click(subject.getByTestId("grey-callout-link"));
    expect(mockPush).toHaveBeenCalled();
    expect(setModalIsVisible).not.toHaveBeenCalled();
  });

  it("directs authenticated user to profile when profile edit button is clicked", async () => {
    useMockProfileData({});
    const setModalIsVisible = jest.fn();
    const subject = render(
      withAuthAlert(
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage
            operateReferences={{}}
            displayContent={emptyDisplayContent}
            profileDisplayContent={createEmptyLoadDisplayContent()}
            sideBarDisplayContent={createEmptySideBarDisplayContent()}
          />
        </ThemeProvider>,
        IsAuthenticated.TRUE,
        { modalIsVisible: false, setModalIsVisible }
      )
    );
    fireEvent.click(subject.getByTestId("grey-callout-link"));
    expect(mockPush).toHaveBeenCalled();
    expect(setModalIsVisible).not.toHaveBeenCalled();
  });

  describe("business information", () => {
    it("shows template with user name as header", async () => {
      useMockUserData({
        profileData: generateProfileData({
          businessName: "some business",
          industryId: "restaurant",
          legalStructureId: "c-corporation",
        }),
        user: generateUser({ name: "Ada Lovelace" }),
      });
      const subject = renderRoadmapPage({});
      const expectedHeaderText = templateEval(Config.roadmapDefaults.roadmapTitleTemplateForUserName, {
        name: "Ada Lovelace",
      });
      expect(subject.getByText(expectedHeaderText)).toBeInTheDocument();
    });

    it("shows header placeholder if no user name present", async () => {
      useMockUserData({
        profileData: generateProfileData({
          businessName: "",
          industryId: "restaurant",
          legalStructureId: "c-corporation",
        }),
        user: generateUser({ name: undefined }),
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-businessName")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
      expect(
        subject.getByText(Config.roadmapDefaults.roadmapTitleBusinessAndUserMissing)
      ).toBeInTheDocument();
    });

    it("shows the human-readable industry from onboarding data", () => {
      useMockProfileData({ industryId: "home-contractor" });
      const subject = renderRoadmapPage({});
      const expectedValue = LookupIndustryById("home-contractor").name;
      expect(subject.getByTestId("mini-profile-industryId")).toHaveTextContent(expectedValue);
    });

    it("shows placeholder if no industry present", async () => {
      useMockProfileData({
        industryId: "generic",
        legalStructureId: "c-corporation",
        municipality: generateMunicipality({}),
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-industryId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the human-readable legal structure from onboarding data", () => {
      useMockProfileData({ legalStructureId: "limited-liability-company" });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-legal-structure")).toHaveTextContent(
        "Limited Liability Company (LLC)"
      );
    });

    it("shows placeholder if no business structure present", async () => {
      useMockProfileData({
        legalStructureId: undefined,
        industryId: "restaurant",
        municipality: generateMunicipality({}),
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByText("Not set")).toBeInTheDocument();
      expect(subject.getByTestId("mini-profile-legal-structure")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the display municipality from onboarding data", () => {
      useMockProfileData({
        municipality: generateMunicipality({ displayName: "Franklin (Hunterdon County)" }),
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-location")).toHaveTextContent("Franklin (Hunterdon County)");
    });

    it("shows placeholder if no municipality present", async () => {
      useMockProfileData({
        legalStructureId: "c-corporation",
        industryId: "restaurant",
        municipality: undefined,
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-location")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows entity id if present", () => {
      useMockProfileData({
        entityId: "1234567890",
        legalStructureId: "limited-liability-company",
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-entityId")).toHaveTextContent("1234567890");
    });

    it("does not show entity id for Trade Name legal structure even if present", () => {
      useMockProfileData({
        legalStructureId: "sole-proprietorship",
        entityId: "1234567890",
      });
      const subject = renderRoadmapPage({});
      expect(subject.queryByTestId("mini-profile-entityId")).not.toBeInTheDocument();
    });

    it("shows EIN with hyphen if present", () => {
      useMockProfileData({
        employerId: "123456789",
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-employerId")).toHaveTextContent("12-3456789");
    });

    it("shows new jersey tax id if present", () => {
      useMockProfileData({
        taxId: "123456789",
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-taxId")).toHaveTextContent("123456789");
    });

    it("shows notes if present", () => {
      useMockProfileData({
        notes: "some notes",
      });
      const subject = renderRoadmapPage({});
      expect(subject.getByTestId("mini-profile-notes")).toHaveTextContent("some notes");
    });

    it("shows placeholder for ein, nj tax id, notes", () => {
      useMockProfileData({
        entityId: undefined,
        employerId: undefined,
        taxId: undefined,
        notes: undefined,
      });
      const subject = renderRoadmapPage({});

      expect(subject.getByTestId("mini-profile-employerId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotEnteredText
      );
      expect(subject.getByTestId("mini-profile-taxId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotEnteredText
      );
      expect(subject.getByTestId("mini-profile-notes")).toHaveTextContent(
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
      const subject = renderRoadmapPage({});
      expect(subject.queryByText("some name")).toBeInTheDocument();
      expect(subject.queryByText("Corporation")).toBeInTheDocument();
      expect(subject.queryByText("Franklin")).toBeInTheDocument();
      expect(subject.queryByText("Restaurant")).toBeInTheDocument();
      expect(subject.queryByText("123456790")).not.toBeInTheDocument();
      expect(subject.queryByText("98-76543210")).not.toBeInTheDocument();
      expect(subject.queryByText("111111111")).not.toBeInTheDocument();
      expect(subject.queryByText("some notes")).not.toBeInTheDocument();

      fireEvent.click(subject.getByText(Config.roadmapDefaults.greyBoxViewMoreText));
      expect(subject.queryByText("some name")).toBeInTheDocument();
      expect(subject.queryByText("Corporation")).toBeInTheDocument();
      expect(subject.queryByText("Franklin")).toBeInTheDocument();
      expect(subject.queryByText("Restaurant")).toBeInTheDocument();
      expect(subject.queryByText("123456790")).toBeInTheDocument();
      expect(subject.queryByText("98-76543210")).toBeInTheDocument();
      expect(subject.queryByText("111111111")).toBeInTheDocument();
      expect(subject.queryByText("some notes")).toBeInTheDocument();

      fireEvent.click(subject.getByText(Config.roadmapDefaults.greyBoxViewLessText));
      expect(subject.queryByText("123456790")).not.toBeInTheDocument();
      expect(subject.queryByText("98-76543210")).not.toBeInTheDocument();
      expect(subject.queryByText("111111111")).not.toBeInTheDocument();
      expect(subject.queryByText("some notes")).not.toBeInTheDocument();
    });

    it("shows business info box if error is CACHED_ONLY", () => {
      useMockUserDataError("CACHED_ONLY");
      const subject = renderRoadmapPage({});
      expect(subject.queryByTestId("grey-callout-link")).toBeInTheDocument();
    });

    it("does not show business info box if error is NO_DATA", () => {
      useMockUserDataError("NO_DATA");
      const subject = renderRoadmapPage({});
      expect(subject.queryByTestId("grey-callout-link")).not.toBeInTheDocument();
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

    const subject = renderRoadmapPage({});

    expect(subject.queryByText("step1", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("1-2 weeks")).toBeInTheDocument();
    expect(subject.queryByText("task1")).toBeInTheDocument();
    expect(subject.queryByText("task2")).toBeInTheDocument();

    expect(subject.queryByText("step2", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("task3")).toBeInTheDocument();
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

    const subject = renderRoadmapPage({});

    expect(subject.queryByText("In progress")).toBeInTheDocument();
    expect(subject.queryByText("Completed")).toBeInTheDocument();
    expect(subject.queryByText("Not started")).toBeInTheDocument();
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

    const subject = renderRoadmapPage({});

    const sectionPlan = subject.getByTestId("section-plan");

    expect(within(sectionPlan).getByText("step1")).toBeInTheDocument();
    expect(within(sectionPlan).getByText("step3")).toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step2")).not.toBeInTheDocument();
    expect(within(sectionPlan).queryByText("step4")).not.toBeInTheDocument();

    const sectionStart = subject.getByTestId("section-start");

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

    const subject = renderRoadmapPage({});

    const sectionStart = subject.getByTestId("section-start");
    const sectionPlan = subject.getByTestId("section-plan");

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

    const subject = renderRoadmapPage({});
    const sectionPlan = subject.getByTestId("section-plan");
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

    const subject = renderRoadmapPage({});
    await waitFor(() =>
      expect(subject.queryByText(Config.taskDefaults.requiredTagText)).not.toBeInTheDocument()
    );

    const requiredIcon = subject.getByLabelText(Config.taskDefaults.requiredTagText);
    fireEvent.mouseOver(requiredIcon);

    await waitFor(() => {
      expect(subject.queryByText(Config.taskDefaults.requiredTagText)).toBeInTheDocument();
      expect(subject.queryByText(Config.taskDefaults.requiredTagText)).toBeVisible();
    });
  });

  describe("oscar graduation modal", () => {
    const renderPage = (userData: UserData): { subject: RenderResult; page: PageHelpers } => {
      const subject = render(
        <WithStatefulUserData initialUserData={userData}>
          <ThemeProvider theme={createTheme()}>
            <RoadmapPage
              operateReferences={{}}
              displayContent={emptyDisplayContent}
              profileDisplayContent={createEmptyLoadDisplayContent()}
              sideBarDisplayContent={createEmptySideBarDisplayContent()}
            />
          </ThemeProvider>
        </WithStatefulUserData>
      );
      const page = createPageHelpers(subject);
      return { subject, page };
    };

    const openGraduationModal = (subject: RenderResult): void => {
      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
    };

    const submitGraduationModal = (subject: RenderResult): void => {
      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationModalContinueButtonText));
    };

    beforeEach(() => {
      setupStatefulUserDataContext();
      mockApi.postGetAnnualFilings.mockImplementation((request) => Promise.resolve(request));
    });

    it("switches user to oscar and sends to dashboard", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: undefined,
          sectorId: undefined,
          industryId: "generic",
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      const { subject, page } = renderPage(userData);

      const date = getCurrentDate().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");

      openGraduationModal(subject);
      expect(subject.getByTestId("graduation-modal")).toBeInTheDocument();
      page.fillText("Business name", "A Clean Business");
      page.selectDate("Date of formation", date);
      page.selectByValue("Sector", "clean-energy");
      page.selectByValue("Ownership", "veteran-owned");
      page.fillText("Existing employees", "1234567");
      submitGraduationModal(subject);

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
            hasExistingBusiness: true,
          },
        });
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("pre-populates fields with data from profile", async () => {
      const date = getCurrentDate().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-partnership",
          businessName: "A Test Business",
          dateOfFormation,
          sectorId: "clean-energy",
          industryId: "generic",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
        }),
      });

      const { subject, page } = renderPage(userData);

      openGraduationModal(subject);
      expect((subject.getByLabelText("Business name") as HTMLInputElement).value).toEqual("A Test Business");
      expect(page.getDateOfFormationValue()).toEqual(date.format("MM/YYYY"));
      expect(page.getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
      expect(subject.queryByLabelText("Ownership")).toHaveTextContent(
        `${LookupOwnershipTypeById("veteran-owned").name}`
      );
      expect((subject.getByLabelText("Existing employees") as HTMLInputElement).value).toEqual("1234567");

      submitGraduationModal(subject);

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
            hasExistingBusiness: true,
          },
        });
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
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
          hasExistingBusiness: true,
          legalStructureId: "limited-liability-partnership",
          dateOfFormation,
          sectorId: "clean-energy",
          industryId: "generic",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
        }),
      });

      const { subject } = renderPage(userData);
      openGraduationModal(subject);
      submitGraduationModal(subject);

      await waitFor(() => {
        expect(currentUserData()).toEqual({
          ...userData,
          taxFilingData: { ...taxData, filings: [] },
        });
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("shows sector for generic industry", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: "generic",
          hasExistingBusiness: false,
          sectorId: undefined,
        }),
      });

      const { subject } = renderPage(userData);

      openGraduationModal(subject);
      expect((subject.queryByLabelText("Sector") as HTMLInputElement)?.value).toEqual("Other Services");
    });

    it("does not show sector for non-generic industry", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          industryId: "restaurant",
          hasExistingBusiness: false,
          sectorId: undefined,
        }),
      });

      const { subject } = renderPage(userData);

      openGraduationModal(subject);
      expect(subject.queryByLabelText("Sector")).not.toBeInTheDocument();
    });

    it("fires validations when clicking submit", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: undefined,
          sectorId: undefined,
          industryId: undefined,
          ownershipTypeIds: [],
          existingEmployees: undefined,
        }),
      });

      const { subject } = renderPage(userData);
      openGraduationModal(subject);
      submitGraduationModal(subject);
      expect(userDataWasNotUpdated()).toEqual(true);
      expect(mockPush).not.toHaveBeenCalledWith("/dashboard");
      expect(subject.getByText(Config.onboardingDefaults.dateOfFormationErrorText)).toBeInTheDocument();
      expect(subject.getByText(Config.onboardingDefaults.errorTextRequiredSector)).toBeInTheDocument();
      expect(
        subject.getByText(Config.onboardingDefaults.errorTextRequiredExistingEmployees)
      ).toBeInTheDocument();
    });

    it("hides date of formation if legal structure does not require public filing ", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "general-partnership",
        }),
      });

      const { subject } = renderPage(userData);

      openGraduationModal(subject);
      expect(subject.getByTestId("graduation-modal")).toBeInTheDocument();
      expect(subject.queryByLabelText("Date of formation")).not.toBeInTheDocument();
    });

    it("disables date of formation if formation getFiling success", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
        }),
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
      });

      const { subject, page } = renderPage(userData);
      openGraduationModal(subject);
      expect(subject.getByLabelText("Date of formation")).toHaveAttribute("disabled");
      expect(page.getDateOfFormationValue()).toEqual(
        parseDateWithFormat(userData.formationData.formationFormData.businessStartDate, "YYYY-MM-DD").format(
          "MM/YYYY"
        )
      );
    });

    it("does not display businessName if formation getFiling success", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
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

      const { subject } = renderPage(userData);
      openGraduationModal(subject);
      expect(subject.queryByTestId("businessName")).toBeNull();
    });

    it("display businessName if formation is not set", () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          businessName: "A Test Business 2",
          legalStructureId: "limited-liability-partnership",
          dateOfFormation: getCurrentDate().add(1, "day").format("YYYY-MM-DD"),
        }),
      });

      const { subject } = renderPage(userData);
      openGraduationModal(subject);
      expect(subject.getByTestId("businessName")).not.toBeNull();
      expect(subject.getByLabelText("Business name")).not.toBeNull();
    });
  });

  describe("sidebar", () => {
    it("renders welcome card", () => {
      const sideBarDisplayContent = generateSideBarContent({
        welcomeCard: generateRoadmapSidebarCard({ contentMd: "WelcomeCardContent" }),
      });

      const subject = renderRoadmapPage({ sideBarDisplayContent });

      expect(subject.getByText("WelcomeCardContent")).toBeInTheDocument();
    });

    it("renders registration card when SignUpToast is closed", async () => {
      const sideBarDisplayContent = generateSideBarContent({
        guestNotRegisteredCard: generateRoadmapSidebarCard({
          contentMd: "not-registered-content",
        }),
        welcomeCard: generateRoadmapSidebarCard({ contentMd: "WelcomeCardContent" }),
      });

      const subject = renderPageWithAuth({
        alertIsVisible: true,
        sideBarDisplayContent,
        isAuthenticated: IsAuthenticated.FALSE,
      });

      expect(subject.queryByText("not-registered-content")).not.toBeInTheDocument();
      expect(subject.getByText("WelcomeCardContent")).toBeInTheDocument();

      fireEvent.click(within(subject.queryByTestId("self-reg-toast") as HTMLElement).getByLabelText("close"));

      await waitFor(() => {
        expect(subject.getByText("not-registered-content")).toBeInTheDocument();
        expect(subject.getByText("WelcomeCardContent")).toBeInTheDocument();
      });
    });

    it("renders successful registration card when user is authenticated", async () => {
      const sideBarDisplayContent = generateSideBarContent({
        guestSuccessfullyRegisteredCard: generateRoadmapSidebarCard({
          contentMd: "successful-registration-content",
        }),
        guestNotRegisteredCard: generateRoadmapSidebarCard({
          contentMd: "not-registered-content",
        }),
        welcomeCard: generateRoadmapSidebarCard({ contentMd: "WelcomeCardContent" }),
      });

      const subject = renderPageWithAuth({
        registrationAlertStatus: "SUCCESS",
        sideBarDisplayContent,
      });

      await waitFor(() => {
        expect(subject.getByText("successful-registration-content")).toBeInTheDocument();
        expect(subject.queryByText("not-registered-content")).not.toBeInTheDocument();
        expect(subject.getByText("WelcomeCardContent")).toBeInTheDocument();
      });
    });

    it("renders successful registration card when not registered card is visible, then user is authenticated", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["not-registered"],
        }),
      });

      const sideBarDisplayContent = generateSideBarContent({
        guestSuccessfullyRegisteredCard: generateRoadmapSidebarCard({
          contentMd: "successful-registration-content",
        }),
        guestNotRegisteredCard: generateRoadmapSidebarCard({
          contentMd: "not-registered-content",
        }),
      });

      const subject = renderPageWithAuth({
        userData,
        registrationAlertStatus: "SUCCESS",
        sideBarDisplayContent,
      });

      await waitFor(() => {
        expect(subject.getByText("successful-registration-content")).toBeInTheDocument();
        expect(subject.queryByText("not-registered-content")).not.toBeInTheDocument();
      });
    });

    it("removes successful registration card when it's closed", async () => {
      const userData = generateUserData({
        preferences: generatePreferences({
          visibleRoadmapSidebarCards: ["successful-registration"],
        }),
      });

      const sideBarDisplayContent = generateSideBarContent({
        guestSuccessfullyRegisteredCard: generateRoadmapSidebarCard({
          contentMd: "successful-registration-content",
          header: "successful-registration-header",
        }),
        welcomeCard: generateRoadmapSidebarCard({ contentMd: "WelcomeCardContent" }),
      });

      const subject = renderPageWithAuth({
        userData,
        sideBarDisplayContent,
      });

      await waitFor(() => {
        expect(subject.getByText("successful-registration-content")).toBeInTheDocument();
      });

      fireEvent.click(
        within(subject.queryByTestId("successful-registration-card") as HTMLElement).getByLabelText("Close")
      );

      await waitFor(() => {
        expect(subject.queryByText("successful-registration-content")).not.toBeInTheDocument();
      });
    });
  });
});
