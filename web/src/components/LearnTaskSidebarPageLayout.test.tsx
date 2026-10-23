import { LearnTaskSidebarPageLayout } from "@/components/LearnTaskSidebarPageLayout";
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
    expect(
      screen.getByText(`${Config.learnPages.stepText} 1 of ${Config.learnPages.steps.length}`),
    ).toBeInTheDocument();
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
    expect(
      screen.getByText(`${Config.learnPages.stepText} 2 of ${Config.learnPages.steps.length}`),
    ).toBeInTheDocument();
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
