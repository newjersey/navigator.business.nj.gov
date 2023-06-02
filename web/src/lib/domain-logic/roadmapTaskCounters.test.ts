import {
  getCompletedTaskCount,
  getIncompleteTaskCount,
  getTotalTaskCount,
} from "@/lib/domain-logic/roadmapTaskCounters";
import { generateRoadmap, generateTask } from "@/test/factories";
import { generateBusiness } from "@businessnjgovnavigator/shared";

describe("Roadmap Task Counters", () => {
  describe("getTotalTaskCount", () => {
    it("returns 1 if roadmap does not exist", () => {
      expect(getTotalTaskCount(undefined)).toEqual(1);
    });

    it("returns number of tasks in roadmap", () => {
      const roadmap = generateRoadmap({ tasks: [generateTask({}), generateTask({})] });
      expect(getTotalTaskCount(roadmap)).toEqual(2);
    });
  });

  describe("getCompletedTaskCount", () => {
    it("returns 0 if roadmap or userData do not exist", () => {
      const expectedEmptyState = { required: 0, optional: 0, total: 0 };
      expect(getCompletedTaskCount(generateRoadmap({}), undefined)).toEqual(expectedEmptyState);
      expect(getCompletedTaskCount(undefined, generateBusiness({}))).toEqual(expectedEmptyState);
    });

    it("returns count of completed required and optional tasks", () => {
      const roadmap = generateRoadmap({
        tasks: [
          generateTask({ required: true, id: "requiredTask1" }),
          generateTask({ required: false, id: "optionalTask1" }),
          generateTask({ required: true, id: "requiredTask2" }),
          generateTask({ required: false, id: "optionalTask2" }),
          generateTask({ required: false, id: "optionalTask3" }),
        ],
      });

      const business = generateBusiness({
        taskProgress: {
          optionalTask1: "COMPLETED",
          optionalTask2: "IN_PROGRESS",
          optionalTask3: "NOT_STARTED",
          requiredTask1: "COMPLETED",
        },
      });

      expect(getCompletedTaskCount(roadmap, business)).toEqual({ required: 1, optional: 1, total: 2 });
    });
  });

  describe("getIncompleteTaskCount", () => {
    it("returns 0 if roadmap or userData do not exist", () => {
      const expectedEmptyState = { required: 0, optional: 0, total: 0 };
      expect(getIncompleteTaskCount(generateRoadmap({}), undefined)).toEqual(expectedEmptyState);
      expect(getIncompleteTaskCount(undefined, generateBusiness({}))).toEqual(expectedEmptyState);
    });

    it("returns count of incomplete required and optional tasks", () => {
      const roadmap = generateRoadmap({
        tasks: [
          generateTask({ required: true, id: "requiredTask1" }),
          generateTask({ required: false, id: "optionalTask1" }),
          generateTask({ required: true, id: "requiredTask2" }),
          generateTask({ required: false, id: "optionalTask2" }),
          generateTask({ required: false, id: "optionalTask3" }),
        ],
      });

      const business = generateBusiness({
        taskProgress: {
          optionalTask1: "COMPLETED",
          optionalTask2: "IN_PROGRESS",
          optionalTask3: "NOT_STARTED",
          requiredTask1: "COMPLETED",
        },
      });

      expect(getIncompleteTaskCount(roadmap, business)).toEqual({ required: 1, optional: 2, total: 3 });
    });
  });
});
