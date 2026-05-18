import { Roadmap } from "@/components/dashboard/Roadmap";
import {
  generateStep,
  generateTask,
  operatingPhasesDisplayingBusinessStructurePrompt,
  operatingPhasesNotDisplayingBusinessStructurePrompt,
} from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import {
  businessStructureTaskId,
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<Roadmap />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
    useMockRouter({});
  });

  const Config = getMergedConfig();

  describe.each(operatingPhasesDisplayingBusinessStructurePrompt)(
    "BusinessStructurePrompt",
    (operatingPhase) => {
      beforeEach(() => {
        useMockBusiness(
          generateBusiness({
            profileData: generateProfileData({ operatingPhase: operatingPhase }),
          }),
        );
      });

      describe(`${operatingPhase}`, () => {
        it("renders the roadmap with the business structure prompt", () => {
          render(<Roadmap />);
          expect(screen.getByTestId("business-structure-prompt")).toBeInTheDocument();
        });

        it("routes user to task page on button click", () => {
          useMockRoadmap({
            tasks: [
              generateTask({ id: businessStructureTaskId, urlSlug: "business-structure-url-slug" }),
            ],
          });
          render(<Roadmap />);
          fireEvent.click(screen.getByText(Config.businessStructurePrompt.buttonText));
          expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/business-structure-url-slug");
        });
      });
    },
  );

  test.each(operatingPhasesNotDisplayingBusinessStructurePrompt)(
    "does not render the roadmap with the business structure prompt for %p",
    (operatingPhase) => {
      useMockBusiness(
        generateBusiness({ profileData: generateProfileData({ operatingPhase: operatingPhase }) }),
      );
      render(<Roadmap />);
      expect(screen.queryByTestId("business-structure-prompt")).not.toBeInTheDocument();
    },
  );

  describe("section progress bar", () => {
    beforeEach(() => {
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: operatingPhasesNotDisplayingBusinessStructurePrompt[0],
          }),
          taskProgress: {},
        }),
      );
    });

    it("shows 0% progress when no tasks are completed", () => {
      const step = generateStep({ section: "START", stepNumber: 1 });
      const task = generateTask({ stepNumber: 1 });
      useMockRoadmap({ steps: [step], tasks: [task] });
      render(<Roadmap />);
      const startSection = screen.getByTestId("section-start");
      const bar = within(startSection).getByTestId("section-progress-bar");
      expect(bar).toHaveStyle({ "--progress": "0%" });
    });

    it("shows 100% progress when all tasks are completed", () => {
      const step = generateStep({ section: "START", stepNumber: 1 });
      const task = generateTask({ id: "task-1", stepNumber: 1 });
      useMockRoadmap({ steps: [step], tasks: [task] });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: operatingPhasesNotDisplayingBusinessStructurePrompt[0],
          }),
          taskProgress: { "task-1": "COMPLETED" },
        }),
      );
      render(<Roadmap />);
      const startSection = screen.getByTestId("section-start");
      const bar = within(startSection).getByTestId("section-progress-bar");
      expect(bar).toHaveStyle({ "--progress": "100%" });
    });

    it("shows 50% progress when half of tasks are completed", () => {
      const step1 = generateStep({ section: "START", stepNumber: 1 });
      const step2 = generateStep({ section: "START", stepNumber: 2 });
      const task1 = generateTask({ id: "task-1", stepNumber: 1 });
      const task2 = generateTask({ id: "task-2", stepNumber: 2 });
      useMockRoadmap({ steps: [step1, step2], tasks: [task1, task2] });
      useMockBusiness(
        generateBusiness({
          profileData: generateProfileData({
            operatingPhase: operatingPhasesNotDisplayingBusinessStructurePrompt[0],
          }),
          taskProgress: { "task-1": "COMPLETED" },
        }),
      );
      render(<Roadmap />);
      const startSection = screen.getByTestId("section-start");
      const bar = within(startSection).getByTestId("section-progress-bar");
      expect(bar).toHaveStyle({ "--progress": "50%" });
    });
  });
});
