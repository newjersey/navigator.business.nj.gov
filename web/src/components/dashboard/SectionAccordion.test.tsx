import { SectionAccordion } from "@/components/dashboard/SectionAccordion";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { SectionType } from "@businessnjgovnavigator/shared/";
import {
  generateBusiness,
  generatePreferences,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));

describe("<SectionAccordion />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupStatefulUserDataContext();
    useMockRoadmap({});
  });

  const statefulRender = (type: SectionType, business: Business): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <SectionAccordion sectionType={type}>BODY CONTENT</SectionAccordion>
      </WithStatefulUserData>
    );
  };

  it("expands and collapses the accordion", async () => {
    statefulRender(
      "PLAN",
      generateBusiness({
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
      generateBusiness({
        preferences: generatePreferences({
          roadmapOpenSections: ["PLAN", "START"],
        }),
      })
    );

    const sectionPlan = screen.getByTestId("plan-header");

    expect(sectionPlan).toBeInTheDocument();
    fireEvent.click(sectionPlan);
    expect(currentBusiness().preferences.roadmapOpenSections).toEqual(["START"]);
    fireEvent.click(sectionPlan);
    expect(currentBusiness().preferences.roadmapOpenSections).toEqual(
      expect.arrayContaining(["PLAN", "START"])
    );
  });
});
