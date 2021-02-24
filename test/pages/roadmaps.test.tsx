import { renderWithFormData } from "../helpers";
import { generateFormData, generateRoadmap, generateStep, generateTask } from "../factories";
import RoadmapPage from "../../pages/roadmaps/[type]";
import { allLegalStructureTasks } from "../../lib/roadmap-builders/addLegalStructureStep.test";

const flushPromises = () => new Promise(setImmediate);

describe("roadmap page", () => {
  const randomRoadmap = generateRoadmap({});
  const randomTasks = { "some-id": generateTask({ id: "some-id" }) };

  it("shows the business name from form data", () => {
    const subject = renderWithFormData(
      <RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />,
      generateFormData({
        businessName: { businessName: "My cool business" },
      })
    );
    expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
  });

  it("shows default title if no business name present", async () => {
    const subject = renderWithFormData(
      <RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />,
      generateFormData({
        businessName: { businessName: undefined },
      })
    );

    await flushPromises();

    expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
  });

  it("shows steps and tasks from roadmap prop", () => {
    const roadmap = generateRoadmap({
      steps: [
        generateStep({
          name: "step1",
          tasks: [generateTask({ name: "task1" }), generateTask({ name: "task2" })],
        }),
        generateStep({
          name: "step2",
          tasks: [generateTask({ name: "task3" })],
        }),
      ],
    });
    const subject = renderWithFormData(
      <RoadmapPage roadmap={roadmap} allTasks={randomTasks} />,
      generateFormData({})
    );
    expect(subject.queryByText("step1", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("task1")).toBeInTheDocument();
    expect(subject.queryByText("task2")).toBeInTheDocument();

    expect(subject.queryByText("step2", { exact: false })).toBeInTheDocument();
    expect(subject.queryByText("task3")).toBeInTheDocument();
  });

  describe("business structure", () => {
    it("shows search business name step if structure in PublicRecordFiling group", () => {
      const subject = renderWithFormData(
        <RoadmapPage roadmap={randomRoadmap} allTasks={allLegalStructureTasks} />,
        generateFormData({
          businessStructure: { businessStructure: "Limited Liability Company (LLC)" },
        })
      );
      expect(subject.queryByText("Form & Register Your Business", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("search_business_name")).toBeInTheDocument();
      expect(subject.queryByText("register_trade_name")).not.toBeInTheDocument();
    });

    it("shows trade name step if structure in TradeName group", () => {
      const subject = renderWithFormData(
        <RoadmapPage roadmap={randomRoadmap} allTasks={allLegalStructureTasks} />,
        generateFormData({
          businessStructure: { businessStructure: "General Partnership" },
        })
      );
      expect(subject.queryByText("Form & Register Your Business", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("search_business_name")).not.toBeInTheDocument();
      expect(subject.queryByText("register_trade_name")).toBeInTheDocument();
    });
  });

  describe("liquor license", () => {
    describe("when the roadmap does not have liquor license steps", () => {
      it("does not show liquor license step even when any location includes it", () => {
        const subject = renderWithFormData(
          <RoadmapPage roadmap={randomRoadmap} allTasks={randomTasks} />,
          generateFormData({
            locations: { locations: [{ license: true }, { license: false }] },
          })
        );
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
        const subject = renderWithFormData(
          <RoadmapPage roadmap={roadmapWithLiquorSteps} allTasks={randomTasks} />,
          generateFormData({
            locations: {},
          })
        );
        expect(subject.queryByText("Other task", { exact: false })).toBeInTheDocument();
        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).not.toBeInTheDocument();
      });

      it("removes liquor license tasks if no location includes it", () => {
        const subject = renderWithFormData(
          <RoadmapPage roadmap={roadmapWithLiquorSteps} allTasks={randomTasks} />,
          generateFormData({
            locations: { locations: [{ license: false }] },
          })
        );

        expect(subject.queryByText("Other task", { exact: false })).toBeInTheDocument();
        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).not.toBeInTheDocument();
      });

      it("keeps liquor license tasks if any location includes it", () => {
        const subject = renderWithFormData(
          <RoadmapPage roadmap={roadmapWithLiquorSteps} allTasks={randomTasks} />,
          generateFormData({
            locations: { locations: [{ license: true }, { license: false }] },
          })
        );
        expect(subject.queryByText("Obtain your Liquor License", { exact: false })).toBeInTheDocument();
        expect(
          subject.queryByText("Confirm liquor license availability", { exact: false })
        ).toBeInTheDocument();
      });
    });
  });
});
