import { BusinessStructurePrompt } from "@/components/dashboard/BusinessStructurePrompt";
import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<BusinessStructurePrompt />", () => {
  const Config = getMergedConfig();

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockRoadmap({
      tasks: [generateTask({ id: businessStructureTaskId, urlSlug: "business-structure-url-slug" })],
    });
  });

  it("hides business structure prompt button when isCTAButtonHidden is true", () => {
    render(<BusinessStructurePrompt isCTAButtonHidden={true} />);
    expect(screen.queryByTestId("business-structure-prompt-button")).not.toBeInTheDocument();
  });

  it("shows business structure prompt button when isCTAButtonHidden is false or not included", () => {
    render(<BusinessStructurePrompt />);
    expect(screen.getByTestId("business-structure-prompt-button")).toBeInTheDocument();
  });

  it("renders general content from config when on any task/url", () => {
    useMockRouter({
      asPath: "/tasks/other-slug",
    });
    render(<BusinessStructurePrompt />);
    expect(screen.getByTestId("content-when-not-on-business-structure-task")).toBeInTheDocument();
    expect(screen.queryByTestId("content-when-on-business-structure-task")).not.toBeInTheDocument();
  });

  it("renders specific content from config when on business structure task/url", () => {
    useMockRouter({
      asPath: "/tasks/business-structure-url-slug",
    });
    render(<BusinessStructurePrompt />);
    expect(screen.getByTestId("content-when-on-business-structure-task")).toBeInTheDocument();
    expect(screen.queryByTestId("content-when-not-on-business-structure-task")).not.toBeInTheDocument();
  });

  it("routes user to business structure task page on button click", () => {
    render(<BusinessStructurePrompt />);
    fireEvent.click(screen.getByText(Config.businessStructurePrompt.buttonText));
    expect(mockRouter.mockPush).toHaveBeenCalledWith("/tasks/business-structure-url-slug");
  });
});
