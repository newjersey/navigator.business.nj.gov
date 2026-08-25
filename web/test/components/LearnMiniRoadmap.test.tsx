import { LearnMiniRoadmap } from "@/components/roadmap/LearnMiniRoadmap";
import { renderWithUserData } from "@/test/render/renderWithUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared";
import { screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("LearnMiniRoadmap", () => {
  it("renders the CMS heading and steps", () => {
    renderWithUserData(<LearnMiniRoadmap activeTaskId={Config.learnPages.steps[1].id} />);

    expect(
      screen.getByRole("heading", { level: 3, name: Config.learnPages.stepsHeader }),
    ).toBeInTheDocument();

    for (const [index, step] of Config.learnPages.steps.entries()) {
      expect(screen.getByRole("link", { name: `Step ${index + 1} ${step.name}` })).toHaveAttribute(
        "href",
        `/learn/${step.id}`,
      );
    }
  });

  it("marks the active CMS step", () => {
    const activeStep = Config.learnPages.steps[1];
    const inactiveStep = Config.learnPages.steps[0];

    renderWithUserData(<LearnMiniRoadmap activeTaskId={activeStep.id} />);

    expect(screen.getByTestId(`mini-roadmap-task-${activeStep.id}`)).toHaveClass(
      "learn-mini-roadmap-task--active",
    );
    expect(screen.getByTestId(`mini-roadmap-task-${inactiveStep.id}`)).not.toHaveClass(
      "learn-mini-roadmap-task--active",
    );
  });
});
