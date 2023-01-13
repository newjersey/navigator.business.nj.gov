import * as useRoadmapModule from "@/lib/data-hooks/useRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { sectionNames } from "@businessnjgovnavigator/shared/userData";

const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

export const useMockRoadmap = (overrides: Partial<Roadmap>): void => {
  const roadmap = generateRoadmap(overrides);
  setMockRoadmapResponse(roadmap);
};

export const setMockRoadmapResponse = (
  roadmap: Roadmap | undefined,
  isSectionCompletedFn?: () => boolean
): void => {
  mockUseRoadmap.mockReturnValue({
    roadmap,
    sectionNamesInRoadmap: [...sectionNames],
    isSectionCompleted: isSectionCompletedFn ?? jest.fn(),
  });
};

export const useMockRoadmapTask = (overrides: Partial<Task>): void => {
  const mockTask = generateTask(overrides);
  useMockRoadmap({
    steps: [generateStep({ stepNumber: mockTask.stepNumber })],
    tasks: [mockTask],
  });
};
