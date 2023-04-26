import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { generateRoadmap, generateStep, generateUserData } from "@/test/factories";
import { setMockRoadmapResponse, useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { SectionType, UserData } from "@businessnjgovnavigator/shared/";
import { generatePreferences } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<SectionAccordion />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const statefulRender = (type: SectionType, userData: UserData): void => {
    render(
      <WithStatefulUserData initialUserData={userData}>
        <SectionAccordion sectionType={type}>BODY CONTENT</SectionAccordion>
      </WithStatefulUserData>
    );
  };

  it("expands and collapses the accordion", async () => {
    statefulRender(
      "PLAN",
      generateUserData({
        preferences: generatePreferences({
          roadmapOpenSections: [],
        }),
      })
    );

    expect(within(screen.getByTestId("section-plan")).getByText("BODY CONTENT")).not.toBeVisible();

    fireEvent.click(screen.getByTestId("plan-header"));
    await waitFor(() => {
      return expect(within(screen.getByTestId("section-plan")).getByText("BODY CONTENT")).toBeVisible();
    });

    fireEvent.click(screen.getByTestId("plan-header"));
    await waitFor(() => {
      return expect(within(screen.getByTestId("section-plan")).getByText("BODY CONTENT")).not.toBeVisible();
    });
  });

  it("adds and removes section from preferences on accordion open/close", () => {
    statefulRender(
      "PLAN",
      generateUserData({
        preferences: generatePreferences({
          roadmapOpenSections: ["PLAN", "START"],
        }),
      })
    );

    const sectionPlan = screen.getByTestId("plan-header");

    expect(sectionPlan).toBeInTheDocument();
    fireEvent.click(sectionPlan);
    expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START"]);
    fireEvent.click(sectionPlan);
    expect(currentUserData().preferences.roadmapOpenSections).toEqual(
      expect.arrayContaining(["PLAN", "START"])
    );
  });

  it("shows completed section logo for a completed section", () => {
    const roadmap = generateRoadmap({ steps: [generateStep({ section: "PLAN" })] });
    setMockRoadmapResponse({ roadmap, isSectionCompletedFn: jest.fn().mockReturnValue(true) });
    statefulRender("PLAN", generateUserData({}));
    expect(screen.getByTestId("completed-plan-section-img")).toBeVisible();
  });
});
