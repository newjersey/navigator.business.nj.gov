import { generateUseUserDataResponse } from "../helpers";
import {
  generateFormData,
  generateRoadmap,
  generateStep,
  generateTask,
  generateUserData,
} from "../factories";
import RoadmapPage from "../../pages/roadmaps/[type]";
import { allLegalStructureTasks } from "../../lib/roadmap-builders/addLegalStructureStep.test";
import * as useUserModule from "../../lib/data/useUserData";
import { render } from "@testing-library/react";
import { BusinessForm } from "../../lib/types/form";

jest.mock("../../lib/data/useUserData", () => ({
  useUserData: jest.fn(),
}));
const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

describe("roadmap page", () => {
  const randomRoadmap = generateRoadmap({});
  const randomTasks = { "some-id": generateTask({ id: "some-id" }) };

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseUserData.mockReturnValue(generateUseUserDataResponse({}));
  });

  describe("business information", () => {
    it("shows the business name from form data", () => {
      useMockFormData({ businessName: { businessName: "My cool business" } });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
      expect(subject.getByText("My cool business's Roadmap")).toBeInTheDocument();
    });

    it("shows placeholder if no business name present", async () => {
      useMockFormData({ businessName: { businessName: undefined } });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
      expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the business industry from form data", () => {
      useMockFormData({ businessType: { businessType: "e-commerce" } });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
      expect(subject.getByText("e-commerce")).toBeInTheDocument();
    });

    it("shows placeholder if no business industry present", async () => {
      useMockFormData({ businessType: { businessType: undefined } });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });

    it("shows the business structure from form data", () => {
      useMockFormData({ businessStructure: { businessStructure: "Limited Liability Company (LLC)" } });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
      expect(subject.getByText("Limited Liability Company (LLC)")).toBeInTheDocument();
    });

    it("shows placeholder if no business structure present", async () => {
      useMockFormData({ businessStructure: { businessStructure: undefined } });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
      expect(subject.getByText("Not set")).toBeInTheDocument();
    });
  });

  it("shows steps and tasks from roadmap prop", () => {
    const roadmap = generateRoadmap({
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

    const subject = render(<RoadmapPage roadmap={roadmap} allTasks={randomTasks} />);

    expect(subject.queryByText("step1", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("1-2 weeks")).toBeInTheDocument();
    expect(subject.queryByText("task1")).toBeInTheDocument();
    expect(subject.queryByText("task2")).toBeInTheDocument();

    expect(subject.queryByText("step2", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("task3")).toBeInTheDocument();
  });

  describe("business structure", () => {
    it("shows search business name step if structure in PublicRecordFiling group", () => {
      useMockFormData({
        businessStructure: { businessStructure: "Limited Liability Company (LLC)" },
      });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={allLegalStructureTasks} />);
      expect(subject.queryByText("Form & Register Your Business", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("search_business_name")).toBeInTheDocument();
      expect(subject.queryByText("register_trade_name")).not.toBeInTheDocument();
    });

    it("shows trade name step if structure in TradeName group", () => {
      useMockFormData({
        businessStructure: { businessStructure: "General Partnership" },
      });
      const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={allLegalStructureTasks} />);

      expect(subject.queryByText("Form & Register Your Business", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("search_business_name")).not.toBeInTheDocument();
      expect(subject.queryByText("register_trade_name")).toBeInTheDocument();
    });
  });

  describe("liquor license", () => {
    describe("when the roadmap does not have liquor license steps", () => {
      it("does not show liquor license step even when any location includes it", () => {
        useMockFormData({
          locations: { locations: [{ license: true }, { license: false }] },
        });
        const subject = render(<RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />);
        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).not.toBeInTheDocument();
      });
    });

    describe("when the roadmap has liquor license tasks", () => {
      const roadmapWithLiquorSteps = generateRoadmap({
        steps: [
          generateStep({
            tasks: [
              generateTask({ id: "liquor_license", name: "Obtain your Liquor License" }),
              generateTask({ id: "anything", name: "Other task" }),
              generateTask({
                id: "liquor_license_availability",
                name: "Confirm liquor license availability",
              }),
            ],
          }),
        ],
      });

      it("removes liquor license tasks if no locations", () => {
        useMockFormData({
          locations: {},
        });
        const subject = render(<RoadmapPage roadmap={roadmapWithLiquorSteps} allTasks={randomTasks} />);
        expect(subject.queryByText("Other task", { exact: false })).toBeInTheDocument();
        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).not.toBeInTheDocument();
      });

      it("removes liquor license tasks if no location includes it", () => {
        useMockFormData({
          locations: { locations: [{ license: false }] },
        });
        const subject = render(<RoadmapPage roadmap={roadmapWithLiquorSteps} allTasks={randomTasks} />);

        expect(subject.queryByText("Other task", { exact: false })).toBeInTheDocument();
        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).not.toBeInTheDocument();
      });

      it("keeps liquor license tasks if any location includes it", () => {
        useMockFormData({
          locations: { locations: [{ license: true }, { license: false }] },
        });
        const subject = render(<RoadmapPage roadmap={roadmapWithLiquorSteps} allTasks={randomTasks} />);

        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).toBeInTheDocument();
      });
    });
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
});
