import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import RoadmapPage from "@/pages/roadmap";
import {
  generateMunicipality,
  generateStep,
  generateTask,
  generatePreferences,
  generateUserData,
} from "@/test/factories";
import {
  setMockUserDataResponse,
  useMockOnboardingData,
  useMockUserData,
  useMockUserDataError,
} from "@/test/mock/mockUseUserData";
import { setMockRoadmapResponse, useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { IndustryLookup } from "@/display-content/IndustryLookup";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { UserData } from "@/lib/types/types";

jest.mock("next/router");
jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("roadmap page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
    useMockRouter({});
  });

  const renderRoadmapPage = (): RenderResult => {
    return render(
      <RoadmapPage
        displayContent={{
          contentMd: "",
          operateDisplayContent: { dateOfFormationMd: "", annualFilingMd: "" },
        }}
      />
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
    useMockOnboardingData({ businessName: "Some Cool Name" });
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
      useMockOnboardingData({ businessName: "My cool business" });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
    });

    it("shows placeholder if no business name present", async () => {
      useMockOnboardingData({ businessName: "", industry: "restaurant", legalStructure: "c-corporation" });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the human-readable industry from onboarding data", () => {
      useMockOnboardingData({ industry: "home-contractor" });
      const subject = renderRoadmapPage();
      const expectedValue = IndustryLookup["home-contractor"].primaryText;
      expect(subject.getByText(expectedValue)).toBeInTheDocument();
    });

    it("shows placeholder if no industry present", async () => {
      useMockOnboardingData({
        industry: "generic",
        legalStructure: "c-corporation",
        municipality: generateMunicipality({}),
      });
      const subject = renderRoadmapPage();
      expect(subject.getByText("X")).toBeInTheDocument();
    });

    it("shows the human-readable legal structure from onboarding data", () => {
      useMockOnboardingData({ legalStructure: "limited-liability-company" });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Limited Liability Company (LLC)")).toBeInTheDocument();
    });

    it("shows placeholder if no business structure present", async () => {
      useMockOnboardingData({
        legalStructure: undefined,
        industry: "restaurant",
        municipality: generateMunicipality({}),
      });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the display municipality from onboarding data", () => {
      useMockOnboardingData({
        municipality: generateMunicipality({ displayName: "Franklin (Hunterdon County)" }),
      });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Franklin (Hunterdon County)")).toBeInTheDocument();
    });

    it("shows placeholder if no municipality present", async () => {
      useMockOnboardingData({
        legalStructure: "c-corporation",
        industry: "restaurant",
        municipality: undefined,
      });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Not set")).toBeInTheDocument();
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

  describe("roadmap sections", () => {
    beforeEach(() => {
      useMockRoadmap({
        steps: [
          generateStep({
            name: "step1",
            section: "PLAN",
            tasks: [generateTask({ id: "task1" })],
          }),
          generateStep({
            name: "step2",
            section: "START",
            tasks: [generateTask({ id: "task2" })],
          }),
        ],
      });
    });

    const statefulRender = (userData: UserData): RenderResult => {
      setupStatefulUserDataContext();
      return render(
        <WithStatefulUserData initialUserData={userData}>
          <RoadmapPage
            displayContent={{
              contentMd: "",
              operateDisplayContent: { dateOfFormationMd: "", annualFilingMd: "" },
            }}
          />
        </WithStatefulUserData>
      );
    };

    it("displays sections based on userData preferences", () => {
      useMockUserData({
        preferences: generatePreferences({
          roadmapOpenSections: ["PLAN", "START", "OPERATE"],
        }),
        taxFilings: [],
      });

      const subject = renderRoadmapPage();

      const sectionStart = subject.getByTestId("section-start");
      const sectionPlan = subject.getByTestId("section-plan");
      const sectionOperate = subject.getByTestId("section-operate");

      expect(within(sectionStart).getByText("step2")).toBeVisible();
      expect(within(sectionPlan).getByText("step1")).toBeVisible();
      expect(within(sectionOperate).getByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeVisible();
    });

    it("expands and collapses the plan, start and operate accordions", async () => {
      const subject = statefulRender(
        generateUserData({
          preferences: generatePreferences({
            roadmapOpenSections: [],
          }),
          taxFilings: [],
        })
      );

      expect(within(subject.getByTestId("section-plan")).getByText("step1")).not.toBeVisible();
      expect(within(subject.getByTestId("section-start")).getByText("step2")).not.toBeVisible();
      expect(
        within(subject.getByTestId("section-operate")).getByText(RoadmapDefaults.operateDateSubmitButtonText)
      ).not.toBeVisible();

      fireEvent.click(subject.getByTestId("plan-header"));
      fireEvent.click(subject.getByTestId("start-header"));
      fireEvent.click(subject.getByTestId("operate-header"));

      await waitFor(() => {
        expect(within(subject.getByTestId("section-plan")).getByText("step1")).toBeVisible();
        expect(within(subject.getByTestId("section-start")).getByText("step2")).toBeVisible();
        expect(
          within(subject.getByTestId("section-operate")).getByText(
            RoadmapDefaults.operateDateSubmitButtonText
          )
        ).toBeVisible();
      });

      fireEvent.click(subject.getByTestId("plan-header"));
      fireEvent.click(subject.getByTestId("start-header"));
      fireEvent.click(subject.getByTestId("operate-header"));

      await waitFor(() => {
        expect(within(subject.getByTestId("section-plan")).getByText("step1")).not.toBeVisible();
        expect(within(subject.getByTestId("section-start")).getByText("step2")).not.toBeVisible();
        expect(
          within(subject.getByTestId("section-operate")).getByText(
            RoadmapDefaults.operateDateSubmitButtonText
          )
        ).not.toBeVisible();
      });
    });

    it("updates userData preferences", async () => {
      const subject = statefulRender(
        generateUserData({
          preferences: generatePreferences({
            roadmapOpenSections: ["PLAN", "START", "OPERATE"],
          }),
        })
      );

      const sectionPlan = subject.getByTestId("plan-header");
      const sectionStart = subject.getByTestId("start-header");
      const sectionOperate = subject.getByTestId("operate-header");

      expect(sectionPlan).toBeInTheDocument();
      expect(sectionStart).toBeInTheDocument();
      fireEvent.click(sectionPlan);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START", "OPERATE"]);
      fireEvent.click(sectionStart);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["OPERATE"]);
      fireEvent.click(sectionOperate);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual([]);
      fireEvent.click(sectionPlan);
      fireEvent.click(sectionStart);
      fireEvent.click(sectionOperate);
      expect(currentUserData().preferences.roadmapOpenSections).toEqual(["PLAN", "START", "OPERATE"]);
    });
  });
});
