import { IndustryRoadmap } from "@/lib/roadmap/roadmapBuilder";
import { loadJsonFiles } from "@/lib/static/helpers";
import path from "path";

const addOnsDir = path.join(process.cwd(), "..", "content", "src", "roadmaps", "add-ons");

export const loadAllAddOns = (): IndustryRoadmap[] => {
  return loadJsonFiles(addOnsDir) as unknown as IndustryRoadmap[];
};
