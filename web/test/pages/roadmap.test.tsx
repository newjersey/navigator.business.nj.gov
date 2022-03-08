import { createEmptyLoadDisplayContent } from "@/lib/types/types";
import RoadmapPage from "@/pages/roadmap";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateMunicipality,
  generatePreferences,
  generateProfileData,
  generateStep,
  generateTask,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { setMockRoadmapResponse, useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  setMockUserDataResponse,
  useMockProfileData,
  useMockUserData,
  useMockUserDataError,
} from "@/test/mock/mockUseUserData";
import { useMockDate } from "@/test/mock/useMockDate";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { createPageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  LookupIndustryById,
  LookupOwnershipTypeById,
  LookupSectorTypeById,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import dayjs from "dayjs";
import React from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/utils/getCurrentDate", () => ({ getCurrentDate: jest.fn() }));

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
    useMockDate("2021-10-01");
    setMobileScreen(false);
  });

  const renderRoadmapPage = (): RenderResult => {
    return render(
      <ThemeProvider theme={createTheme()}>
        <RoadmapPage
          operateReferences={{}}
          displayContent={emptyDisplayContent}
          profileDisplayContent={createEmptyLoadDisplayContent()}
        />
      </ThemeProvider>
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    const subject = renderRoadmapPage();
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText(Config.roadmapDefaults.roadmapTitleNotSet)).toBeNull();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    const subject = renderRoadmapPage();
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText(Config.roadmapDefaults.roadmapTitleNotSet)).toBeNull();
  });

  it("shows user data and loading spinner when user data loaded but not roadmap", () => {
    useMockProfileData({ businessName: "Some Cool Name" });
    setMockRoadmapResponse(undefined);
    const subject = renderRoadmapPage();
    expect(subject.getByText("Business Roadmap for Some Cool Name")).toBeInTheDocument();
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
  });

  it("redirects to onboarding if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    renderRoadmapPage();
    expect(mockPush).toHaveBeenCalledWith("/onboarding");
  });

  it("shows toast alert when success query is true", async () => {
    useMockProfileData({});
    useMockRouter({ isReady: true, query: { success: "true" } });
    const subject = renderRoadmapPage();
    await waitFor(() =>
      expect(subject.getByText(Config.profileDefaults.successTextHeader)).toBeInTheDocument()
    );
  });

  describe("business information", () => {
    it("shows the business name from onboarding data", () => {
      useMockProfileData({ businessName: "My cool business" });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-businessName")).toHaveTextContent("My cool business");
      expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
    });

    it("shows placeholder if no business name present", async () => {
      useMockProfileData({
        businessName: "",
        industryId: "restaurant",
        legalStructureId: "c-corporation",
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-businessName")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the human-readable industry from onboarding data", () => {
      useMockProfileData({ industryId: "home-contractor" });
      const subject = renderRoadmapPage();
      const expectedValue = LookupIndustryById("home-contractor").name;
      expect(subject.getByTestId("mini-profile-industryId")).toHaveTextContent(expectedValue);
    });

    it("shows placeholder if no industry present", async () => {
      useMockProfileData({
        industryId: "generic",
        legalStructureId: "c-corporation",
        municipality: generateMunicipality({}),
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-industryId")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the human-readable legal structure from onboarding data", () => {
      useMockProfileData({ legalStructureId: "limited-liability-company" });
      const subject = renderRoadmapPage();
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
      const subject = renderRoadmapPage();
      expect(subject.getByText("Not set")).toBeInTheDocument();
      expect(subject.getByTestId("mini-profile-legal-structure")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows the display municipality from onboarding data", () => {
      useMockProfileData({
        municipality: generateMunicipality({ displayName: "Franklin (Hunterdon County)" }),
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-location")).toHaveTextContent("Franklin (Hunterdon County)");
    });

    it("shows placeholder if no municipality present", async () => {
      useMockProfileData({
        legalStructureId: "c-corporation",
        industryId: "restaurant",
        municipality: undefined,
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-location")).toHaveTextContent(
        Config.roadmapDefaults.greyBoxNotSetText
      );
    });

    it("shows entity id if present", () => {
      useMockProfileData({
        entityId: "1234567890",
        legalStructureId: "limited-liability-company",
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-entityId")).toHaveTextContent("1234567890");
    });

    it("does not show entity id for Trade Name legal structure even if present", () => {
      useMockProfileData({
        legalStructureId: "sole-proprietorship",
        entityId: "1234567890",
      });
      const subject = renderRoadmapPage();
      expect(subject.queryByTestId("mini-profile-entityId")).not.toBeInTheDocument();
    });

    it("shows EIN with hyphen if present", () => {
      useMockProfileData({
        employerId: "123456789",
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-employerId")).toHaveTextContent("12-3456789");
    });

    it("shows new jersey tax id if present", () => {
      useMockProfileData({
        taxId: "123456789",
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-taxId")).toHaveTextContent("123456789");
    });

    it("shows notes if present", () => {
      useMockProfileData({
        notes: "some notes",
      });
      const subject = renderRoadmapPage();
      expect(subject.getByTestId("mini-profile-notes")).toHaveTextContent("some notes");
    });

    it("shows placeholder for ein, nj tax id, notes", () => {
      useMockProfileData({
        entityId: undefined,
        employerId: undefined,
        taxId: undefined,
        notes: undefined,
      });
      const subject = renderRoadmapPage();

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
      const subject = renderRoadmapPage();
      expect(subject.queryByText("some name")).toBeInTheDocument();
      expect(subject.queryByText("C Corporation")).toBeInTheDocument();
      expect(subject.queryByText("Franklin")).toBeInTheDocument();
      expect(subject.queryByText("Restaurant")).toBeInTheDocument();
      expect(subject.queryByText("123456790")).not.toBeInTheDocument();
      expect(subject.queryByText("98-76543210")).not.toBeInTheDocument();
      expect(subject.queryByText("111111111")).not.toBeInTheDocument();
      expect(subject.queryByText("some notes")).not.toBeInTheDocument();

      fireEvent.click(subject.getByText(Config.roadmapDefaults.greyBoxViewMoreText));
      expect(subject.queryByText("some name")).toBeInTheDocument();
      expect(subject.queryByText("C Corporation")).toBeInTheDocument();
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
      const subject = renderRoadmapPage();
      expect(subject.queryByTestId("grey-callout-link")).toBeInTheDocument();
    });

    it("does not show business info box if error is NO_DATA", () => {
      useMockUserDataError("NO_DATA");
      const subject = renderRoadmapPage();
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

    const subject = renderRoadmapPage();

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

    const subject = renderRoadmapPage();

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

    const subject = renderRoadmapPage();

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

    const subject = renderRoadmapPage();

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

    const subject = renderRoadmapPage();
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

    const subject = renderRoadmapPage();
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
    let userData = generateUserData({});
    const getRoadMap = () =>
      render(
        <WithStatefulUserData initialUserData={userData}>
          <ThemeProvider theme={createTheme()}>
            <RoadmapPage
              operateReferences={{}}
              displayContent={emptyDisplayContent}
              profileDisplayContent={createEmptyLoadDisplayContent()}
            />
          </ThemeProvider>
        </WithStatefulUserData>
      );

    beforeEach(() => {
      setupStatefulUserDataContext();
    });

    it("switches user to oscar and sends to dashboard", async () => {
      userData = generateUserData({
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

      const subject = getRoadMap();

      const date = dayjs().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");

      const helpers = createPageHelpers(subject);
      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
      expect(subject.getByTestId("onboarding-modal")).toBeInTheDocument();
      helpers.selectDate("Date of formation", date);
      helpers.selectByValue("Sector", "clean-energy");
      helpers.selectByValue("Ownership", "veteran-owned");
      helpers.fillText("Existing employees", "1234567");
      fireEvent.click(subject.getByTestId("onboardingModalSubmit"));
      expect(currentUserData()).toEqual({
        ...userData,
        profileData: {
          ...userData.profileData,
          dateOfFormation,
          sectorId: "clean-energy",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
          hasExistingBusiness: true,
        },
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
    });

    it("pre-populates fields with data from profile", async () => {
      const date = dayjs().subtract(1, "month").date(1);
      const dateOfFormation = date.format("YYYY-MM-DD");
      userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-partnership",
          dateOfFormation,
          sectorId: "clean-energy",
          industryId: undefined,
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
        }),
      });

      const subject = getRoadMap();

      const helpers = createPageHelpers(subject);
      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
      expect(subject.getByTestId("onboarding-modal")).toBeInTheDocument();
      expect(helpers.getDateOfFormationValue()).toEqual(date.format("MM/YYYY"));
      expect(helpers.getSectorIDValue()).toEqual(LookupSectorTypeById("clean-energy").name);
      expect(subject.queryByLabelText("Ownership")).toHaveTextContent(
        `${LookupOwnershipTypeById("veteran-owned").name}`
      );
      expect((subject.getByLabelText("Existing employees") as HTMLInputElement).value).toEqual("1234567");

      fireEvent.click(subject.getByTestId("onboardingModalSubmit"));
      expect(currentUserData()).toEqual({
        ...userData,
        profileData: {
          ...userData.profileData,
          dateOfFormation,
          sectorId: "clean-energy",
          ownershipTypeIds: ["veteran-owned"],
          existingEmployees: "1234567",
          hasExistingBusiness: true,
        },
      });
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
    });

    it("hides date of formation if legal structure does not require public filing ", async () => {
      userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "general-partnership",
        }),
      });

      const subject = getRoadMap();

      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
      expect(subject.getByTestId("onboarding-modal")).toBeInTheDocument();
      expect(subject.queryByLabelText("Date of formation")).not.toBeInTheDocument();
      fireEvent.click(subject.getByTestId("onboardingModalSubmit"));
    });

    it("auto fills sector based on sectorDefault in the industry object", async () => {
      userData = generateUserData({
        profileData: generateProfileData({
          industryId: "restaurant",
          hasExistingBusiness: false,
          sectorId: undefined,
        }),
      });

      const subject = getRoadMap();

      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
      fireEvent.click(subject.getByTestId("onboardingModalSubmit"));
      expect(subject.getByTestId("onboarding-modal")).toBeInTheDocument();
      expect((subject.queryByLabelText("Sector") as HTMLInputElement)?.value).toEqual(
        "Accommodation and Food Services"
      );
    });

    it("fires validations when clicking submit", async () => {
      userData = generateUserData({
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

      const subject = getRoadMap();
      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
      fireEvent.click(subject.getByTestId("onboardingModalSubmit"));
      expect(userDataWasNotUpdated()).toEqual(true);
      await waitFor(() => expect(mockPush).not.toHaveBeenCalledWith("/dashboard"));
      expect(subject.getByText(Config.onboardingDefaults.dateOfFormationErrorText)).toBeInTheDocument();
      expect(subject.getByText(Config.onboardingDefaults.errorTextRequiredSector)).toBeInTheDocument();
      expect(
        subject.getByText(Config.onboardingDefaults.errorTextRequiredExistingEmployees)
      ).toBeInTheDocument();
    });

    it("disables date of formation if formation getFiling success", () => {
      userData = generateUserData({
        profileData: generateProfileData({
          hasExistingBusiness: false,
          legalStructureId: "limited-liability-partnership",
        }),
        formationData: generateFormationData({
          getFilingResponse: generateGetFilingResponse({
            success: true,
          }),
        }),
      });

      const subject = getRoadMap();
      fireEvent.click(subject.getByText(Config.roadmapDefaults.graduationButtonText));
      const helpers = createPageHelpers(subject);
      expect(subject.getByLabelText("Date of formation")).toHaveAttribute("disabled");
      expect(helpers.getDateOfFormationValue()).toEqual(
        dayjs(userData.formationData.formationFormData.businessStartDate, "YYYY-MM-DD").format("MM/YYYY")
      );
    });
  });
});
