import fs from "fs";
import path from "path";
import { Roadmap, RoadmapFromFile } from "../types/types";
import { getTaskById } from "./loadTasks";

export type PathParams<P> = { params: P; locale?: string };
export type RoadmapTypeParam = {
  type: string;
};

const roadmapsDir = path.join(process.cwd(), "roadmaps");

export const getAllRoadmapTypes = (): PathParams<RoadmapTypeParam>[] => {
  const fileNames: string[] = fs.readdirSync(path.join(roadmapsDir, "business-types"));

  return fileNames.map((fileName) => {
    return {
      params: {
        type: fileName.replace(/\.json$/, ""),
      },
    };
  });
};

export const getRoadmapByType = (type: string): Roadmap => {
  const fullPath = path.join(roadmapsDir, "business-types", `${type}.json`);
  const roadmapFromFile = JSON.parse(fs.readFileSync(fullPath, "utf8")) as RoadmapFromFile;

  return {
    ...roadmapFromFile,
    steps: roadmapFromFile.steps.map((step) => ({
      ...step,
      tasks: step.tasks.map(getTaskById),
    })),
  };
};
