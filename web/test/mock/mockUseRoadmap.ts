import * as useRoadmapModule from "@/lib/data-hooks/useRoadmap";
import { Roadmap, SectionCompletion, Task } from "@/lib/types/types";
import { generateRoadmap, generateSectionCompletion, generateStep, generateTask } from "@/test/factories";
import { sectionNames } from "@businessnjgovnavigator/shared/userData";

const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

export const useMockRoadmap = (
  overrides: Partial<Roadmap>,
  statusOverrides = {} as Partial<SectionCompletion>
): void => {
  const roadmap = generateRoadmap(overrides);
  const sectionCompletion = generateSectionCompletion(statusOverrides);
  setMockRoadmapResponse(roadmap, sectionCompletion);
};

export const setMockRoadmapResponse = (
  roadmap: Roadmap | undefined,
  sectionCompletion?: SectionCompletion
): void => {
  const updateSectionCompletion = (sectionCompletion?: SectionCompletion): SectionCompletion => {
    return sectionCompletion ?? generateSectionCompletion({});
  };
  mockUseRoadmap.mockReturnValue({
    roadmap,
    sectionCompletion,
    updateSectionCompletion,
    sectionNamesInRoadmap: [...sectionNames],
  });
};

export const useMockRoadmapTask = (overrides: Partial<Task>): void => {
  const mockTask = generateTask(overrides);
  useMockRoadmap({
    steps: [generateStep({ stepNumber: mockTask.stepNumber })],
    tasks: [mockTask],
  });
};
