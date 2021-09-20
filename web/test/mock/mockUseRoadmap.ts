import * as useRoadmapModule from "@/lib/data-hooks/useRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";

const mockUseRoadmap = (useRoadmapModule as jest.Mocked<typeof useRoadmapModule>).useRoadmap;

export const useMockRoadmap = (overrides: Partial<Roadmap>): void => {
  setMockRoadmapResponse(generateRoadmap(overrides));
};

export const setMockRoadmapResponse = (roadmap: Roadmap | undefined): void => {
  mockUseRoadmap.mockReturnValue({ roadmap });
};

export const useMockRoadmapTask = (overrides: Partial<Task>): void => {
  useMockRoadmap({
    steps: [
      generateStep({
        tasks: [generateTask(overrides)],
      }),
    ],
  });
};
