import path from "node:path";
import type { IndustryRoadmap } from "../types/types";
import { loadJsonFiles } from "./helpers";

const addOnsDirectory = path.join(process.cwd(), "..", "content", "src", "roadmaps", "add-ons");
const addOnsDirectoryTest = path.join(process.cwd(), "content", "src", "roadmaps", "add-ons");

export const loadAllAddOns = (isTest: boolean = false): IndustryRoadmap[] => {
  if (isTest) {
    return loadJsonFiles(addOnsDirectoryTest) as unknown as IndustryRoadmap[];
  }
  return loadJsonFiles(addOnsDirectory) as unknown as IndustryRoadmap[];
};
