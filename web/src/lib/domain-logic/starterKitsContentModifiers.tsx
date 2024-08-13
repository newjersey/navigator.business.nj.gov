import { modifyContent } from "@/lib/domain-logic/modifyContent";

export const insertRoadmapSteps = (content: string, roadMapsStepsLength: string): string => {
  return modifyContent({
    content,
    condition: () => true,
    modificationMap: {
      numberRoadMapSteps: roadMapsStepsLength,
    },
  });
};

export const insertIndustryContent = (content: string, industryId: string, industryName: string): string => {
  return modifyContent({
    content,
    condition: () => industryId !== "generic",
    modificationMap: {
      industry: industryName,
    },
  });
};
