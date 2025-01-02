import * as useRoadmapModule from "@/lib/data-hooks/useRoadmap";
import { CurrentAndNextSection } from "@/lib/data-hooks/useRoadmap";
import { Roadmap, Task } from "@/lib/types/types";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { sectionNames, SectionType } from "@businessnjgovnavigator/shared/userData";

const mockUseRoadmap = (useRoadmapModule as vi.Mocked<typeof useRoadmapModule>).useRoadmap;

export const useMockRoadmap = (overrides: Partial<Roadmap>): void => {
  const roadmap = generateRoadmap(overrides);
  setMockRoadmapResponse({ roadmap });
};

export const setMockRoadmapResponse = (params: {
  roadmap: Roadmap | undefined;
  isSectionCompletedFn?: () => boolean;
  currentAndNextSection?: () => { current: SectionType; next: SectionType | undefined };
}): void => {
  mockUseRoadmap.mockReturnValue({
    roadmap: params.roadmap,
    sectionNamesInRoadmap: [...sectionNames],
    isSectionCompleted: params.isSectionCompletedFn ?? vi.fn(),
    currentAndNextSection:
      params.currentAndNextSection ?? ((): CurrentAndNextSection => ({ current: "PLAN", next: "START" })),
  });
};

export const useMockRoadmapTask = (overrides: Partial<Task>): void => {
  const mockTask = generateTask(overrides);
  useMockRoadmap({
    steps: [generateStep({ stepNumber: mockTask.stepNumber })],
    tasks: [mockTask],
  });
};
