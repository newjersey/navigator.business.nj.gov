import React from "react";
import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import RoadmapPage from "@/pages/roadmap";
import {
  generateMunicipality,
  generateProfileData,
  generatePreferences,
  generateStep,
  generateTask,
  generateTaxFiling,
  generateTaxFilingData,
} from "@/test/factories";
import {
  setMockUserDataResponse,
  useMockProfileData,
  useMockUserData,
  useMockUserDataError,
} from "@/test/mock/mockUseUserData";
import { setMockRoadmapResponse, useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import { FilingReference } from "@/lib/types/types";
import { useMockDate } from "../mock/useMockDate";
import * as materialUi from "@mui/material";

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
  operateDisplayContent: {
    filingCalendarMd: "",
    entityIdErrorNotFoundMd: "",
    entityIdErrorNotRegisteredMd: "",
    entityIdMd: "",
  },
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
          filingsReferences={{} as Record<string, FilingReference>}
          displayContent={emptyDisplayContent}
        />
      </ThemeProvider>
    );
  };

  it("shows loading page if page has not loaded yet", () => {
    setMockUserDataResponse({ userData: undefined });
    const subject = renderRoadmapPage();
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.roadmapTitleNotSet)).toBeNull();
  });

  it("shows loading page if user not finished onboarding", () => {
    useMockUserData({ formProgress: "UNSTARTED" });
    const subject = renderRoadmapPage();
    expect(subject.getByText("Loading", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.roadmapTitleNotSet)).toBeNull();
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
        RoadmapDefaults.greyBoxNotSetText
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
        RoadmapDefaults.greyBoxNotSetText
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
        RoadmapDefaults.greyBoxNotSetText
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
        RoadmapDefaults.greyBoxNotSetText
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
        RoadmapDefaults.greyBoxNotEnteredText
      );
      expect(subject.getByTestId("mini-profile-taxId")).toHaveTextContent(
        RoadmapDefaults.greyBoxNotEnteredText
      );
      expect(subject.getByTestId("mini-profile-notes")).toHaveTextContent(
        RoadmapDefaults.greyBoxNotEnteredText
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
      expect(subject.queryByText("C-Corporation")).toBeInTheDocument();
      expect(subject.queryByText("Franklin")).toBeInTheDocument();
      expect(subject.queryByText("Restaurant")).toBeInTheDocument();
      expect(subject.queryByText("123456790")).not.toBeInTheDocument();
      expect(subject.queryByText("98-76543210")).not.toBeInTheDocument();
      expect(subject.queryByText("111111111")).not.toBeInTheDocument();
      expect(subject.queryByText("some notes")).not.toBeInTheDocument();

      fireEvent.click(subject.getByText(RoadmapDefaults.greyBoxViewMoreText));
      expect(subject.queryByText("some name")).toBeInTheDocument();
      expect(subject.queryByText("C-Corporation")).toBeInTheDocument();
      expect(subject.queryByText("Franklin")).toBeInTheDocument();
      expect(subject.queryByText("Restaurant")).toBeInTheDocument();
      expect(subject.queryByText("123456790")).toBeInTheDocument();
      expect(subject.queryByText("98-76543210")).toBeInTheDocument();
      expect(subject.queryByText("111111111")).toBeInTheDocument();
      expect(subject.queryByText("some notes")).toBeInTheDocument();

      fireEvent.click(subject.getByText(RoadmapDefaults.greyBoxViewLessText));
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
        roadmapOpenSections: ["PLAN", "START", "OPERATE"],
      }),
      taxFilingData: generateTaxFilingData({ entityIdStatus: "UNKNOWN" }),
    });

    const subject = renderRoadmapPage();

    const sectionStart = subject.getByTestId("section-start");
    const sectionPlan = subject.getByTestId("section-plan");
    const sectionOperate = subject.getByTestId("section-operate");

    expect(within(sectionStart).getByText("step2")).toBeVisible();
    expect(within(sectionPlan).getByText("step1")).toBeVisible();
    expect(within(sectionOperate).getByText(RoadmapDefaults.operateFormSubmitButtonText)).toBeVisible();
  });

  it("renders the calendar when entity ID is validated", () => {
    useMockDate("2021-11-01");

    useMockRoadmap({
      steps: [
        generateStep({ name: "step1", section: "PLAN" }),
        generateStep({ name: "step2", section: "START" }),
      ],
    });

    useMockUserData({
      profileData: generateProfileData({}),
      preferences: generatePreferences({
        roadmapOpenSections: ["OPERATE"],
      }),
      taxFilingData: generateTaxFilingData({
        entityIdStatus: "EXISTS_AND_REGISTERED",
        filings: [
          generateTaxFiling({
            identifier: "some-tax-filing-identifier-1",
            dueDate: "2021-11-30",
          }),
        ],
      }),
    });

    const filingRef: Record<string, FilingReference> = {
      "some-tax-filing-identifier-1": {
        name: "some-name-1",
        urlSlug: "some-urlSlug-1",
      },
    };

    const renderRoadmapPage = (): RenderResult => {
      return render(
        <ThemeProvider theme={createTheme()}>
          <RoadmapPage filingsReferences={filingRef} displayContent={emptyDisplayContent} />
        </ThemeProvider>
      );
    };

    const subject = renderRoadmapPage();
    const annualReportLink = subject.getByTestId("some-tax-filing-identifier-1");
    const currMonth = subject.getByTestId(dayjs().format("Nov 2021"));
    expect(currMonth).toContainElement(annualReportLink);
    expect(annualReportLink).toHaveAttribute("href", "filings/some-urlSlug-1");
  });
});
