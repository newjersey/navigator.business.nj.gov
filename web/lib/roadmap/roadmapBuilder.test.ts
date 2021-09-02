import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap } from "@/lib/types/types";

describe("roadmapBuilder", () => {
  it("builds a generic roadmap with generic tasks only, and removes empty step 5", async () => {
    const roadmap = await buildRoadmap({
      addOns: [],
      modifications: [],
    });

    const roadmapNormalized = {
      ...roadmap,
      steps: roadmap.steps.map((step) => {
        return {
          ...step,
          tasks: step.tasks.map((task) => ({
            ...task,
            contentMd: task.contentMd.replace(/(\r\n|\r)/g, "\n"),
          })),
        };
      }),
    };

    expect(roadmapNormalized).toEqual(expectedGenericRoadmap);
  });

  it("adds tasks from multiple add-ons", async () => {
    const roadmap = await buildRoadmap({
      addOns: ["coffee", "tea"],
      modifications: [],
    });

    expect(roadmap.steps[0].tasks.map((it) => it.id)).toEqual(
      expect.arrayContaining(["generic-task-1-id", "coffee-task-1-id"])
    );

    expect(roadmap.steps[1].tasks.map((it) => it.id)).toEqual(
      expect.arrayContaining(["generic-task-2-id", "coffee-task-2-id", "tea-task-1-id"])
    );

    expect(roadmap.steps[2].tasks.map((it) => it.id)).toEqual(
      expect.arrayContaining(["generic-task-3-id", "tea-task-2-id"])
    );
  });

  it("applies modifications to tasks after add-ons", async () => {
    const roadmap = await buildRoadmap({
      addOns: ["coffee"],
      modifications: ["coffee"],
    });

    expect(roadmap.steps[0].tasks.map((it) => it.id)).toEqual(
      expect.arrayContaining(["generic-task-1-id", "coffee-task-1-id"])
    );

    expect(roadmap.steps[1].tasks.map((it) => it.id)).toEqual(
      expect.arrayContaining(["generic-task-2-id", "coffee-task-2-id"])
    );

    expect(roadmap.steps[2].tasks.map((it) => it.id)).toEqual(expect.arrayContaining(["coffee-task-3-id"]));

    expect(roadmap.steps[3].tasks.map((it) => it.id)).toEqual(expect.arrayContaining(["coffee-task-4-id"]));
  });

  it("orders tasks in a step by weight", async () => {
    const roadmap = await buildRoadmap({
      addOns: ["weighted"],
      modifications: [],
    });

    expect(roadmap.steps[0].tasks.map((it) => it.id)).toEqual([
      "weighted-task-0-id",
      "generic-task-1-id",
      "weighted-task-10-id",
    ]);
  });

  it("includes step 5 if it has tasks", async () => {
    const roadmap = await buildRoadmap({
      addOns: ["mocha"],
      modifications: [],
    });

    expect(roadmap.steps[4].tasks.map((it) => it.id)).toEqual(["mocha-task-5-id"]);
  });
});

const expectedGenericRoadmap: Roadmap = {
  steps: [
    {
      step_number: 1,
      name: "Step 1 Name",
      timeEstimate: "1 month",
      description: "Step 1 description",
      tasks: [
        {
          id: "generic-task-1-id",
          name: "Generic Task 1",
          urlSlug: "generic-task-1-url-slug",
          callToActionLink: "www.generic-task-1.com",
          callToActionText: "Generic Task 1 CTA",
          contentMd: "\nGeneric Task 1 Contents\n",
        },
      ],
    },
    {
      step_number: 2,
      name: "Step 2 Name",
      timeEstimate: "2 months",
      description: "Step 2 description",
      tasks: [
        {
          id: "generic-task-2-id",
          name: "Generic Task 2",
          urlSlug: "generic-task-2-url-slug",
          callToActionLink: "www.generic-task-2.com",
          callToActionText: "Generic Task 2 CTA",
          contentMd: "\nGeneric Task 2 Contents\n",
        },
      ],
    },
    {
      step_number: 3,
      name: "Step 3 Name",
      timeEstimate: "3 months",
      description: "Step 3 description",
      tasks: [
        {
          id: "generic-task-3-id",
          name: "Generic Task 3",
          urlSlug: "generic-task-3-url-slug",
          callToActionLink: "www.generic-task-3.com",
          callToActionText: "Generic Task 3 CTA",
          contentMd: "\nGeneric Task 3 Contents\n",
        },
      ],
    },
    {
      step_number: 4,
      name: "Step 4 Name",
      timeEstimate: "4 months",
      description: "Step 4 description",
      tasks: [
        {
          id: "generic-task-4-id",
          name: "Generic Task 4",
          urlSlug: "generic-task-4-url-slug",
          callToActionLink: "www.generic-task-4.com",
          callToActionText: "Generic Task 4 CTA",
          contentMd: "\nGeneric Task 4 Contents\n",
        },
      ],
    },
  ],
};
