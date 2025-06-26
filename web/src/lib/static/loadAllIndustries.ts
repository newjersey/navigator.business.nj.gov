import { loadJsonFiles } from "@/lib/static/helpers";
import { Industry } from "@businessnjgovnavigator/shared/industry";
import path from "path";

const industriesDir = path.join(process.cwd(), "..", "content", "src", "roadmaps", "industries");

export const loadAllIndustries = (): Industry[] => {
  return loadJsonFiles(industriesDir) as unknown as Industry[];
}; // this might be unecessary, see getIndustries function in industry.ts
