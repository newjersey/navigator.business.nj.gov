import fs from "fs";
import { getAllRoadmapTypes, getRoadmapByType } from "./loadRoadmaps";
import { generateRoadmapFromFile, generateStepFromFile, generateTask } from "../../test/factories";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadRoadmaps", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("getAllRoadmapTypes", () => {
    it("returns a list of roadmap types from directory structure", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mockedFs.readdirSync.mockReturnValue(["type1.json", "type2.json"]);

      const allRoadmapTypes = getAllRoadmapTypes();
      expect(allRoadmapTypes).toHaveLength(2);
      expect(allRoadmapTypes).toEqual(
        expect.arrayContaining([{ params: { type: "type1" } }, { params: { type: "type2" } }])
      );
    });
  });

  describe("getRoadmapByType", () => {
    it("returns roadmap entity with tasks resolved", () => {
      const roadmapFromFile = generateRoadmapFromFile({
        steps: [
          generateStepFromFile({ tasks: ["task1", "task2"] }),
          generateStepFromFile({ tasks: ["task3"] }),
        ],
      });

      const task1 = generateTask({ id: "task1" });
      const task2 = generateTask({ id: "task2" });
      const task3 = generateTask({ id: "task3" });

      mockedFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(roadmapFromFile))
        .mockReturnValueOnce(JSON.stringify(task1))
        .mockReturnValueOnce(JSON.stringify(task2))
        .mockReturnValueOnce(JSON.stringify(task3));

      const roadmap = getRoadmapByType("some-type");

      expect(roadmap).toEqual({
        ...roadmapFromFile,
        steps: [
          {
            ...roadmapFromFile.steps[0],
            tasks: [task1, task2],
          },
          {
            ...roadmapFromFile.steps[1],
            tasks: [task3],
          },
        ],
      });
    });
  });
});
