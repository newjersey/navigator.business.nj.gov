import { generateUseUserDataResponse } from "../helpers";
import {
  generateOnboardingData,
  generateRoadmap,
  generateStep,
  generateTask,
  generateUserData,
} from "../factories";
import * as useUserModule from "../../lib/data/useUserData";
import * as useRoadmapModule from "../../lib/data/useRoadmap";
import { render } from "@testing-library/react";
import RoadmapPage from "../../pages/roadmap";
import { OnboardingData, Roadmap } from "../../lib/types/types";

jest.mock("../../lib/data/useUserData", () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

jest.mock("../../lib/data/useRoadmap", () => ({
  useRoadmap: jest.fn(),
}));
const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

describe("roadmap page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseUserData.mockReturnValue(generateUseUserDataResponse({}));
    mockUseRoadmap.mockReturnValue({ roadmap: generateRoadmap({}) });
  });

  describe("business information", () => {
    it("shows the business name from onboarding data", () => {
      useMockOnboardingData({ businessName: "My cool business" });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
    });

    it("shows placeholder if no business name present", async () => {
      useMockOnboardingData({ businessName: "" });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the industry from onboarding data", () => {
      useMockOnboardingData({ industry: "e-commerce" });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("e-commerce")).toBeInTheDocument();
    });

    it("shows placeholder if no industry present", async () => {
      useMockOnboardingData({ industry: "generic" });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the legal structure from onboarding data", () => {
      useMockOnboardingData({ legalStructure: "Limited Liability Company (LLC)" });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Limited Liability Company (LLC)")).toBeInTheDocument();
    });

    it("shows placeholder if no business structure present", async () => {
      useMockOnboardingData({ legalStructure: undefined });
      const subject = render(<RoadmapPage />);
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

    const subject = render(<RoadmapPage />);

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

    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: generateUserData({
          taskProgress: {
            task1: "IN_PROGRESS",
            task2: "COMPLETED",
          },
        }),
      })
    );

    const subject = render(<RoadmapPage />);

    expect(subject.queryByText("In-progress")).toBeInTheDocument();
    expect(subject.queryByText("Completed")).toBeInTheDocument();
    expect(subject.queryByText("Not started")).toBeInTheDocument();
  });

  const useMockOnboardingData = (onboardingData: Partial<OnboardingData>): void => {
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: generateUserData({
          onboardingData: generateOnboardingData(onboardingData),
        }),
      })
    );
  };

  const useMockRoadmap = (roadmap: Partial<Roadmap>): void => {
    mockUseRoadmap.mockReturnValue({ roadmap: generateRoadmap(roadmap) });
  };
});
