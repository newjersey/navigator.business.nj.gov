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

  it("uses domestic employer steps when industry is domestic-employer", async () => {
    const roadmap = await buildRoadmap({
      industryId: "domestic-employer",
      addOns: [],
    });

    expect(roadmap.steps[0].name).toEqual("Register as an Employer");
  });

  it("does not break with empty roadmap", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: [],
    });

    expect(roadmap.steps).toHaveLength(0);
  });

  it("builds a roadmap with task add-ons only when industry is undefined", async () => {
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

  it("builds a roadmap with license task add-ons only when industry is undefined", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: ["license-addon"],
    });
    expect(
      roadmap.tasks.map((it) => {
        return it.id;
      })
    ).toEqual(expect.arrayContaining(["license-task-1-id"]));
  });

  it("removes any steps that have no tasks", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: ["tea"],
    });

    expect(roadmap.steps).toHaveLength(3);
  });

  it("builds a generic roadmap with generic tasks only, and removes empty step 5", async () => {
    const roadmap = await buildRoadmap({
      industryId: "standard",
      addOns: [],
    });
    expect(roadmap).toEqual(expectedGenericRoadmap);
  });

  it("prioritizes a task over a license task when building a roadmap with add-ons", async () => {
    const roadmap = await buildRoadmap({
      industryId: "coffee",
      addOns: ["task-and-license-addon"],
    });
    const roadmapIds = roadmap.tasks.map((it) => {
      return it.id;
    });
    expect(roadmapIds).toContain("tea-task-1-id");
    expect(roadmapIds).not.toContain("license-task-1-id");
  });

  it("builds a roadmap with license task add-ons", async () => {
    const roadmap = await buildRoadmap({
      industryId: "coffee",
      addOns: ["license-addon"],
    });
    expect(
      roadmap.tasks.map((it) => {
        return it.id;
      })
    ).toEqual(expect.arrayContaining(["license-task-1-id"]));
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

  it("adds tasks from addOns with required when required is true", async () => {
    const roadmap = await buildRoadmap({
      industryId: undefined,
      addOns: ["tea"],
    });
    const requiredTask = roadmap.tasks.find((it) => {
      return it.required === true;
    });

    expect(requiredTask?.id).toEqual("tea-task-2-required-id");
  });

  it("removes duplicate tasks from task list from multiple addons", async () => {
    const roadmap1 = await buildRoadmap({
      industryId: "standard",
      addOns: ["tea"],
    });
    const roadmap2 = await buildRoadmap({
      industryId: "standard",
      addOns: ["tea", "tea-2"],
    });

    expect(roadmap1.tasks.length).toEqual(roadmap2.tasks.length);
  });

  it("removes duplicate tasks from add ons and industries", async () => {
    const roadmap = await buildRoadmap({
      industryId: "standard",
      addOns: ["tea-2"],
    });

    expect(
      roadmap.tasks.filter((task) => {
        return task.filename === "generic-task-1";
      }).length
    ).toEqual(1);
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
      displayname: "generic-task-1",
      filename: "generic-task-1",
      stepNumber: 1,
      name: "Generic Task 1",
      urlSlug: "generic-task-1-url-slug",
      callToActionLink: "www.generic-task-1.com",
      callToActionText: "Generic Task 1 CTA",
      summaryDescriptionMd: "Generic Task 1 Summary",
      contentMd: `${EOL}Generic Task 1 Contents${EOL}`,
      unlockedBy: [],
      required: false,
    },
    {
      id: "generic-task-2-id",
      displayname: "generic-task-2",
      filename: "generic-task-2",
      stepNumber: 1,
      name: "Generic Task 2",
      urlSlug: "generic-task-2-url-slug",
      callToActionLink: "www.generic-task-2.com",
      callToActionText: "Generic Task 2 CTA",
      summaryDescriptionMd: "Generic Task 2 Summary",
      contentMd: `${EOL}Generic Task 2 Contents${EOL}`,
      unlockedBy: [],
      required: false,
    },
    {
      id: "generic-task-3-id",
      name: "Generic Task 3",
      stepNumber: 2,
      displayname: "generic-task-3",
      filename: "generic-task-3",
      urlSlug: "generic-task-3-url-slug",
      callToActionLink: "www.generic-task-3.com",
      callToActionText: "Generic Task 3 CTA",
      summaryDescriptionMd: "Generic Task 3 Summary",
      contentMd: `${EOL}Generic Task 3 Contents${EOL}`,
      unlockedBy: [],
      required: false,
    },
    {
      id: "generic-task-4-id",
      name: "Generic Task 4",
      stepNumber: 3,
      displayname: "generic-task-4",
      filename: "generic-task-4",
      urlSlug: "generic-task-4-url-slug",
      callToActionLink: "www.generic-task-4.com",
      callToActionText: "Generic Task 4 CTA",
      summaryDescriptionMd: "Generic Task 4 Summary",
      contentMd: `${EOL}Generic Task 4 Contents${EOL}`,
      unlockedBy: [],
      required: false,
    },
  ],
};
