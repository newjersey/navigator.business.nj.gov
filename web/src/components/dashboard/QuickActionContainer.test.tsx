import { QuickActionsContainer } from "@/components/dashboard/QuickActionContainer";
import { QuickActionLink, QuickActionTask } from "@/lib/types/types";
import { generateQuickActionLink, generateQuickActionTask } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const renderQuickActions = ({
  tasks,
  links,
}: {
  tasks?: QuickActionTask[];
  links?: QuickActionLink[];
}): void => {
  render(<QuickActionsContainer quickActionTasks={tasks || []} quickActionLinks={links || []} />);
};

describe("<QuickActionContainer />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  it("renders task and link when apply to all value is true", () => {
    const tasks = [
      generateQuickActionTask({
        applyToAllUsers: true,
        name: "task - match",
      }),
      generateQuickActionTask({
        applyToAllUsers: false,
        name: "task - no match",
      }),
    ];

    const links = [
      generateQuickActionLink({
        applyToAllUsers: true,
        name: "link - match",
      }),
      generateQuickActionLink({
        applyToAllUsers: false,
        name: "link - no match",
      }),
    ];
    renderQuickActions({ tasks, links });
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("task - match");
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("link - match");
    expect(screen.getByTestId("quick-actions-section")).not.toHaveTextContent("task - no match");
    expect(screen.getByTestId("quick-actions-section")).not.toHaveTextContent("link - no match");
  });

  it("renders task and link when industry is a match", () => {
    useMockBusiness({
      profileData: generateProfileData({
        industryId: "accounting",
      }),
    });

    const tasks = [
      generateQuickActionTask({
        industryIds: ["accounting"],
        applyToAllUsers: false,
        name: "task - match",
      }),
      generateQuickActionTask({
        industryIds: ["real estate"],
        applyToAllUsers: false,
        name: "task - no match",
      }),
    ];

    const links = [
      generateQuickActionLink({
        industryIds: ["accounting"],
        applyToAllUsers: false,
        name: "link - match",
      }),
      generateQuickActionLink({
        industryIds: ["real estate"],
        applyToAllUsers: false,
        name: "link - no match",
      }),
    ];
    renderQuickActions({ tasks, links });
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("task - match");
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("link - match");
    expect(screen.getByTestId("quick-actions-section")).not.toHaveTextContent("task - no match");
    expect(screen.getByTestId("quick-actions-section")).not.toHaveTextContent("link - no match");
  });

  it("renders task and link when sector is a match", () => {
    useMockBusiness({
      profileData: generateProfileData({
        sectorId: "accounting",
      }),
    });

    const tasks = [
      generateQuickActionTask({
        sectorIds: ["accounting"],
        applyToAllUsers: false,
        name: "task - match",
      }),
      generateQuickActionTask({
        sectorIds: ["real estate"],
        applyToAllUsers: false,
        name: "task - no match",
      }),
    ];

    const links = [
      generateQuickActionLink({
        sectorIds: ["accounting"],
        applyToAllUsers: false,
        name: "link - match",
      }),
      generateQuickActionLink({
        sectorIds: ["real estate"],
        applyToAllUsers: false,
        name: "link - no match",
      }),
    ];
    renderQuickActions({ tasks, links });
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("task - match");
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("link - match");
    expect(screen.getByTestId("quick-actions-section")).not.toHaveTextContent("task - no match");
    expect(screen.getByTestId("quick-actions-section")).not.toHaveTextContent("link - no match");
  });

  it("renders muitiple tasks and links", () => {
    useMockBusiness({
      profileData: generateProfileData({
        sectorId: "accountingSector",
        industryId: "accountingIndustry",
      }),
    });

    const tasks = [
      generateQuickActionTask({
        sectorIds: ["accountingSector"],
        applyToAllUsers: false,
        name: "task - sector match",
      }),
      generateQuickActionTask({
        industryIds: ["accountingIndustry"],
        applyToAllUsers: false,
        name: "task - industry match",
      }),
    ];

    const links = [
      generateQuickActionLink({
        sectorIds: ["accountingSector"],
        applyToAllUsers: false,
        name: "link - sector match",
      }),
      generateQuickActionLink({
        industryIds: ["accountingIndustry"],
        applyToAllUsers: false,
        name: "link - industry match",
      }),
    ];
    renderQuickActions({ tasks, links });
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("task - sector match");
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("task - industry match");
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("link - sector match");
    expect(screen.getByTestId("quick-actions-section")).toHaveTextContent("link - industry match");
  });
});
