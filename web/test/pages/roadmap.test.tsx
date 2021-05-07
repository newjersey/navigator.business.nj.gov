import { render, RenderResult } from "@testing-library/react";
import RoadmapPage from "@/pages/roadmap";
import { generateMunicipality, generateStep, generateTask } from "@/test/factories";
import { useMockOnboardingData, useMockUserData } from "@/test/mock/mockUseUserData";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";

jest.mock("@/lib/auth/useAuthProtectedPage");
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("roadmap page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
    useMockRoadmap({});
  });

  const renderRoadmapPage = (): RenderResult => {
    return render(<RoadmapPage displayContent={{ contentMd: "" }} />);
  };

  describe("business information", () => {
    it("shows the business name from onboarding data", () => {
      useMockOnboardingData({ businessName: "My cool business" });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
    });

    it("shows placeholder if no business name present", async () => {
      useMockOnboardingData({ businessName: "", industry: "restaurant", legalStructure: "b-corporation" });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the human-readable industry from onboarding data", () => {
      useMockOnboardingData({ industry: "home-contractor" });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Home-Improvement Contractor")).toBeInTheDocument();
    });

    it("shows placeholder if no industry present", async () => {
      useMockOnboardingData({
        industry: "generic",
        legalStructure: "b-corporation",
        municipality: generateMunicipality({}),
      });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Not set")).toBeInTheDocument();
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
        legalStructure: "b-corporation",
        industry: "restaurant",
        municipality: undefined,
      });
      const subject = renderRoadmapPage();
      expect(subject.getByText("Not set")).toBeInTheDocument();
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

    expect(subject.queryByText("In-progress")).toBeInTheDocument();
    expect(subject.queryByText("Completed")).toBeInTheDocument();
    expect(subject.queryByText("Not started")).toBeInTheDocument();
  });
});
