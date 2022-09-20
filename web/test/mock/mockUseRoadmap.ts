import * as useRoadmapModule from "@/lib/data-hooks/useRoadmap";
import { Roadmap, SectionCompletion, Task } from "@/lib/types/types";
import { generateRoadmap, generateSectionCompletion, generateStep, generateTask } from "@/test/factories";

const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

export const useMockRoadmap = (
  overrides: Partial<Roadmap>,
  statusOverrides = {} as Partial<SectionCompletion>
): void => {
  const roadmap = generateRoadmap(overrides);
  const sectionCompletion = generateSectionCompletion(roadmap, statusOverrides);
  setMockRoadmapResponse(roadmap, sectionCompletion);
};

export const setMockRoadmapResponse = (
  roadmap: Roadmap | undefined,
  sectionCompletion?: SectionCompletion
): void => {
  const updateSectionCompletion = (sectionCompletion?: SectionCompletion): SectionCompletion => {
    return sectionCompletion ?? generateSectionCompletion(roadmap as Roadmap, {});
  };
  mockUseRoadmap.mockReturnValue({ roadmap, sectionCompletion, updateSectionCompletion });
};

export const useMockRoadmapTask = (overrides: Partial<Task>): void => {
  const mockTask = generateTask(overrides);
  useMockRoadmap({
    steps: [generateStep({ stepNumber: mockTask.stepNumber })],
    tasks: [mockTask],
  });
};
