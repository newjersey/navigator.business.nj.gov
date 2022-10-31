import { buildRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { Roadmap } from "@/lib/types/types";
import { EOL } from "os";

describe("roadmapBuilder", () => {
  it("uses foreign steps when industry is undefined", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: ["tea"],
    });

    expect(roadmap.steps[0].name).toEqual("Foreign Step 1 Name");
  });

  it("does not break with empty roadmap", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: [],
    });

    expect(roadmap.steps).toHaveLength(0);
  });

  it("builds a roadmap with add-ons only when industry is undefined", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: ["tea"],
    });
    expect(
      roadmap.tasks.map((it) => {
        return it.id;
      })
    ).toEqual(expect.arrayContaining(["tea-task-1-id"]));
  });

  it("removes any steps that have no tasks", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: ["tea"],
    });

    expect(roadmap.steps).toHaveLength(2);
  });

  it("builds a generic roadmap with generic tasks only, and removes empty step 5", async () => {
    const roadmap = await buildRoadmap({
      industryId: "standard",
      addOns: [],
    });
    expect(roadmap).toEqual(expectedGenericRoadmap);
  });

  it("adds tasks from multiple add-ons", async () => {
    const roadmap = await buildRoadmap({
      industryId: "coffee",
      addOns: ["tea"],
    });

    expect(
      roadmap.tasks.map((it) => {
        return { id: it.id, stepNumber: it.stepNumber };
      })
    ).toEqual(
      expect.arrayContaining([
        { id: "generic-task-1-id", stepNumber: 1 },
        { id: "coffee-task-1-id", stepNumber: 1 },
        { id: "generic-task-2-id", stepNumber: 1 },
        { id: "coffee-task-2-id", stepNumber: 1 },
        { id: "tea-task-1-id", stepNumber: 1 },
        { id: "coffee-task-3-id", stepNumber: 2 },
        { id: "tea-task-2-id", stepNumber: 2 },
      ])
    );
  });

  it("applies modifications to tasks after add-ons", async () => {
    const roadmap = await buildRoadmap({
      industryId: "coffee",
      addOns: [],
    });

    expect(
      roadmap.tasks.map((it) => {
        return { id: it.id, stepNumber: it.stepNumber };
      })
    ).toEqual([
      { id: "generic-task-1-id", stepNumber: 1 },
      { id: "coffee-task-2-id", stepNumber: 1 },
      { id: "coffee-task-1-id", stepNumber: 1 },
      { id: "generic-task-2-id", stepNumber: 1 },
      { id: "coffee-task-3-id", stepNumber: 2 },
      { id: "coffee-task-4-id", stepNumber: 3 },
    ]);
  });

  it("orders tasks in a step by weight", async () => {
    const roadmap = await buildRoadmap({
      industryId: "standard",
      addOns: ["weighted"],
    });

    expect(
      roadmap.tasks.map((it) => {
        return { id: it.id, stepNumber: it.stepNumber };
      })
    ).toEqual([
      { id: "weighted-task-0-id", stepNumber: 1 },
      { id: "generic-task-1-id", stepNumber: 1 },
      { id: "generic-task-2-id", stepNumber: 1 },
      { id: "weighted-task-10-id", stepNumber: 1 },
      { id: "generic-task-3-id", stepNumber: 2 },
      { id: "weighted-task-9-id", stepNumber: 2 },
      { id: "generic-task-4-id", stepNumber: 3 },
    ]);
  });

  it("includes step 5 if it has tasks", async () => {
    const roadmap = await buildRoadmap({
      industryId: "standard",
      addOns: ["mocha"],
    });

    expect(
      roadmap.tasks
        .map((it) => {
          return it.id;
        })
        .includes("mocha-task-5-id")
    ).toBeTruthy();
  });

  it("adds unlockedBy to tasks from dependencies file without duplicate url-slugs", async () => {
    const roadmap = await buildRoadmap({
      industryId: "standard",
      addOns: ["blocking"],
    });

    const blockedTask = roadmap.tasks.find((it) => {
      return it.id === "blocked-id";
    });
    expect(blockedTask?.unlockedBy).toEqual([
      {
        name: "Blocking Task 2",
        urlSlug: "blocking-task-2-url-slug",
        filename: "blocking-task-2",
        id: "blocking-task-2-id",
      },
      {
        name: "Blocking Task 1 Duplicate",
        urlSlug: "blocking-task-1-url-slug",
        filename: "blocking-task-1-duplicate",
        id: "blocking-task-1-id",
      },
    ]);
  });
});

const expectedGenericRoadmap: Roadmap = {
  steps: [
    {
      stepNumber: 1,
      name: "Step 1 Name",
      section: "PLAN",
      timeEstimate: "1 month",
      description: "Step 1 description",
    },
    {
      stepNumber: 2,
      name: "Step 2 Name",
      section: "START",
      timeEstimate: "3 months",
      description: "Step 2 description",
    },
    {
      stepNumber: 3,
      name: "Step 3 Name",
      timeEstimate: "4 months",
      section: "START",
      description: "Step 3 description",
    },
  ],
  tasks: [
    {
      id: "generic-task-1-id",
      filename: "generic-task-1",
      stepNumber: 1,
      name: "Generic Task 1",
      urlSlug: "generic-task-1-url-slug",
      callToActionLink: "www.generic-task-1.com",
      callToActionText: "Generic Task 1 CTA",
      contentMd: `${EOL}Generic Task 1 Contents${EOL}`,
      unlockedBy: [],
    },
    {
      id: "generic-task-2-id",
      filename: "generic-task-2",
      stepNumber: 1,
      name: "Generic Task 2",
      urlSlug: "generic-task-2-url-slug",
      callToActionLink: "www.generic-task-2.com",
      callToActionText: "Generic Task 2 CTA",
      contentMd: `${EOL}Generic Task 2 Contents${EOL}`,
      unlockedBy: [],
    },
    {
      id: "generic-task-3-id",
      name: "Generic Task 3",
      stepNumber: 2,
      filename: "generic-task-3",
      urlSlug: "generic-task-3-url-slug",
      callToActionLink: "www.generic-task-3.com",
      callToActionText: "Generic Task 3 CTA",
      contentMd: `${EOL}Generic Task 3 Contents${EOL}`,
      unlockedBy: [],
    },
    {
      id: "generic-task-4-id",
      name: "Generic Task 4",
      stepNumber: 3,
      filename: "generic-task-4",
      urlSlug: "generic-task-4-url-slug",
      callToActionLink: "www.generic-task-4.com",
      callToActionText: "Generic Task 4 CTA",
      contentMd: `${EOL}Generic Task 4 Contents${EOL}`,
      unlockedBy: [],
    },
  ],
};
