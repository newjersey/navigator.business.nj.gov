import { generateUseUserDataResponse } from "../helpers";
import {
  generateFormData,
  generateRoadmap,
  generateStep,
  generateTask,
  generateUserData,
} from "../factories";
import * as useUserModule from "../../lib/data/useUserData";
import * as useRoadmapModule from "../../lib/data/useRoadmap";
import { render } from "@testing-library/react";
import { BusinessForm } from "../../lib/types/form";
import RoadmapPage from "../../pages/roadmap";
import { Roadmap } from "../../lib/types/types";

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
    it("shows the business name from form data", () => {
      useMockFormData({ businessName: { businessName: "My cool business" } });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
    });

    it("shows placeholder if no business name present", async () => {
      useMockFormData({ businessName: { businessName: undefined } });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the business industry from form data", () => {
      useMockFormData({ businessType: { businessType: "e-commerce" } });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("e-commerce")).toBeInTheDocument();
    });

    it("shows placeholder if no business industry present", async () => {
      useMockFormData({ businessType: { businessType: undefined } });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the business structure from form data", () => {
      useMockFormData({ businessStructure: { businessStructure: "Limited Liability Company (LLC)" } });
      const subject = render(<RoadmapPage />);
      expect(subject.getByText("Limited Liability Company (LLC)")).toBeInTheDocument();
    });

    it("shows placeholder if no business structure present", async () => {
      useMockFormData({ businessStructure: { businessStructure: undefined } });
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

  const useMockFormData = (formData: Partial<BusinessForm>): void => {
    mockUseUserData.mockReturnValue(
      generateUseUserDataResponse({
        userData: generateUserData({
          formData: generateFormData(formData),
        }),
      })
    );
  };

  const useMockRoadmap = (roadmap: Partial<Roadmap>): void => {
    mockUseRoadmap.mockReturnValue({ roadmap: generateRoadmap(roadmap) });
  };
});
