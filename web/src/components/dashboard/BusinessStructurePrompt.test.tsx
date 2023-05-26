import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("<BusinessStructurePrompt />", () => {
  const Config = getMergedConfig();

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("hides business structure prompt button", () => {
    render(<BusinessStructurePrompt isButtonHidden={true} />);
    expect(screen.queryByTestId("business-structure-prompt-button")).not.toBeInTheDocument();
  });

  it("shows business structure prompt button", () => {
    render(<BusinessStructurePrompt />);
    expect(screen.getByTestId("business-structure-prompt-button")).toBeInTheDocument();
  });

  it("renders notCompletedTaskPromptAnyTask from config", () => {
    useMockRouter({
      asPath: "any",
    });
    render(<BusinessStructurePrompt />);
    expect(screen.getByTestId("any-task-content")).toBeInTheDocument();
    expect(screen.queryByTestId("business-structure-task-content")).not.toBeInTheDocument();
  });

  it("renders notCompletedTaskPromptBusinessStructureTask from config", () => {
    useMockRouter({
      asPath: ROUTES.businessStructureTask,
    });
    render(<BusinessStructurePrompt />);
    expect(screen.getByTestId("business-structure-task-content")).toBeInTheDocument();
    expect(screen.queryByTestId("any-task-content")).not.toBeInTheDocument();
  });

  it("routes user to task page on button click", () => {
    render(<BusinessStructurePrompt />);
    fireEvent.click(screen.getByText(Config.businessStructurePrompt.buttonText));
    expect(mockRouter.mockPush).toHaveBeenCalledWith(ROUTES.businessStructureTask);
  });
});
