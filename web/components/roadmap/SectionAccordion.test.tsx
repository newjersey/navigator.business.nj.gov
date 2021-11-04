import React from "react";
import {
  generatePreferences,
  generateRoadmap,
  generateSectionCompletion,
  generateStep,
  generateUserData,
} from "@/test/factories";
import { fireEvent, render, RenderResult, waitFor, within } from "@testing-library/react";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { SectionType, UserData } from "@/lib/types/types";
import { SectionAccordion } from "@/components/roadmap/SectionAccordion";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<SectionAccordion />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  const statefulRender = (type: SectionType, userData: UserData): RenderResult => {
    setupStatefulUserDataContext();
    return render(
      <WithStatefulUserData initialUserData={userData}>
        <SectionAccordion sectionType={type}>BODY CONTENT</SectionAccordion>
      </WithStatefulUserData>
    );
  };

  it("expands and collapses the accordion", async () => {
    const subject = statefulRender(
      "PLAN",
      generateUserData({
        preferences: generatePreferences({
          roadmapOpenSections: [],
        }),
      })
    );

    expect(within(subject.getByTestId("section-plan")).getByText("BODY CONTENT")).not.toBeVisible();

    fireEvent.click(subject.getByTestId("plan-header"));
    await waitFor(() =>
      expect(within(subject.getByTestId("section-plan")).getByText("BODY CONTENT")).toBeVisible()
    );

    fireEvent.click(subject.getByTestId("plan-header"));
    await waitFor(() =>
      expect(within(subject.getByTestId("section-plan")).getByText("BODY CONTENT")).not.toBeVisible()
    );
  });

  it("adds and removes section from preferences on accordion open/close", async () => {
    const subject = statefulRender(
      "PLAN",
      generateUserData({
        preferences: generatePreferences({
          roadmapOpenSections: ["PLAN", "START", "OPERATE"],
        }),
      })
    );

    const sectionPlan = subject.getByTestId("plan-header");

    expect(sectionPlan).toBeInTheDocument();
    fireEvent.click(sectionPlan);
    expect(currentUserData().preferences.roadmapOpenSections).toEqual(["START", "OPERATE"]);
    fireEvent.click(sectionPlan);
    expect(currentUserData().preferences.roadmapOpenSections).toEqual(
      expect.arrayContaining(["PLAN", "START", "OPERATE"])
    );
  });

  it("checks completed section logo given section status", async () => {
    const roadmap = generateRoadmap({ steps: [generateStep({ section: "PLAN" })] });
    const sectionCompletion = generateSectionCompletion(roadmap, { PLAN: true });
    useMockRoadmap(roadmap, sectionCompletion);
    const subject = statefulRender("PLAN", generateUserData({}));
    expect(subject.getByTestId("completed-plan-section-img")).toBeVisible();
  });
});
