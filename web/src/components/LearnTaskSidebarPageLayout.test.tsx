import { LearnTaskSidebarPageLayout } from "@/components/LearnTaskSidebarPageLayout";
import { templateEval } from "@/lib/utils/helpers";
import { ConfigContext } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());

const Config = getMergedConfig();
const activeStep = Config.learnPages.steps[0];
const getStepCounterText = (currentStep: number): string =>
  templateEval(Config.learnPages.stepCounterText, {
    currentStep: String(currentStep),
    totalSteps: String(Config.learnPages.steps.length),
  });

describe("<LearnTaskSidebarPageLayout />", () => {
  beforeEach(() => {
    (useMediaQuery as jest.Mock).mockReturnValue(false);
  });

  it("shows the active step and expands the mobile step navigation", () => {
    render(
      <LearnTaskSidebarPageLayout taskId={activeStep.id}>Page content</LearnTaskSidebarPageLayout>,
    );
    const accordion = screen.getByRole("group");
    const summaryTitle = screen.getByText(activeStep.name, { selector: "summary span" });

    expect(accordion).not.toHaveAttribute("open");
    expect(screen.getByText(getStepCounterText(1))).toBeInTheDocument();
    expect(summaryTitle).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();

    fireEvent.click(summaryTitle);

    expect(accordion).toHaveAttribute("open");
    const navigation = screen.getByRole("navigation", { name: Config.learnPages.stepsHeader });
    expect(within(navigation).getAllByRole("link")).toHaveLength(Config.learnPages.steps.length);
    const activeTask = within(navigation).getByTestId(`mini-roadmap-task-${activeStep.id}`);
    expect(within(navigation).getAllByRole("link")[0]).toHaveAttribute(
      "href",
      `/learn/${activeStep.id}`,
    );
    expect(activeTask).toHaveClass("learn-mini-roadmap-task--active");

    fireEvent.click(summaryTitle);
    expect(accordion).not.toHaveAttribute("open");
  });

  it("keeps the existing desktop sidebar", () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true);
    render(
      <LearnTaskSidebarPageLayout taskId={activeStep.id}>Page content</LearnTaskSidebarPageLayout>,
    );

    const navigation = screen.getByRole("navigation", { name: "Secondary" });
    expect(within(navigation).getByText(Config.learnPages.stepsHeader)).toBeInTheDocument();
    expect(within(navigation).getAllByRole("link")).toHaveLength(Config.learnPages.steps.length);
  });

  it("uses the configured counter wording", () => {
    const stepCounterText = "${currentStep}/${totalSteps}";
    render(
      <ConfigContext.Provider
        value={{
          config: {
            ...Config,
            learnPages: { ...Config.learnPages, stepCounterText },
          },
          setOverrides: jest.fn(),
        }}
      >
        <LearnTaskSidebarPageLayout taskId={activeStep.id}>Page content</LearnTaskSidebarPageLayout>
      </ConfigContext.Provider>,
    );

    expect(screen.getByText(`1/${Config.learnPages.steps.length}`)).toBeInTheDocument();
  });

  it("updates the active step while keeping the accordion open", () => {
    const { rerender } = render(
      <LearnTaskSidebarPageLayout taskId={activeStep.id}>Page content</LearnTaskSidebarPageLayout>,
    );
    fireEvent.click(screen.getByText(activeStep.name, { selector: "summary span" }));

    const nextStep = Config.learnPages.steps[1];
    rerender(
      <LearnTaskSidebarPageLayout taskId={nextStep.id}>Page content</LearnTaskSidebarPageLayout>,
    );

    expect(screen.getByRole("group")).toHaveAttribute("open");
    expect(screen.getByText(getStepCounterText(2))).toBeInTheDocument();
    expect(screen.getByText(nextStep.name, { selector: "summary span" })).toBeInTheDocument();
  });

  it("hides the mobile navigation when the roadmap is disabled", () => {
    render(
      <LearnTaskSidebarPageLayout taskId={activeStep.id} hideMiniRoadmap>
        Page content
      </LearnTaskSidebarPageLayout>,
    );

    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });
});
