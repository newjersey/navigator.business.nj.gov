import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { generateOperateReference, generateStep, generateUserData } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { render } from "@testing-library/react";
import React from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/router");

describe("<SidebarPageLayout />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData(generateUserData({}));
    useMockRoadmap({
      steps: [generateStep({ section: "PLAN" }), generateStep({ section: "START" })],
    });
    (useMediaQuery as jest.Mock).mockImplementation(() => true); // set large screen
  });

  it("links back to /roadmap when user is starting a business", () => {
    useMockProfileData({ hasExistingBusiness: false });
    const subject = render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(subject.getByTestId("back-to-roadmap").getAttribute("href")).toEqual("/roadmap");
  });

  it("links back to /dashboard when user owns a business", () => {
    useMockProfileData({ hasExistingBusiness: true });
    const subject = render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(subject.getByTestId("back-to-roadmap").getAttribute("href")).toEqual("/dashboard");
  });

  it("shows only operate section when there are operateReferences", () => {
    const operateReferences = { "some-id": generateOperateReference({}) };
    const subject = render(
      <SidebarPageLayout operateReferences={operateReferences}>stuff</SidebarPageLayout>
    );
    expect(subject.queryByText(Config.sectionHeaders.OPERATE)).toBeInTheDocument();
    expect(subject.queryByText(Config.sectionHeaders.PLAN)).not.toBeInTheDocument();
    expect(subject.queryByText(Config.sectionHeaders.START)).not.toBeInTheDocument();
  });

  it("shows only plan/start sections when there are no operateReferences", () => {
    const subject = render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(subject.queryByText(Config.sectionHeaders.OPERATE)).not.toBeInTheDocument();
    expect(subject.queryByText(Config.sectionHeaders.PLAN)).toBeInTheDocument();
    expect(subject.queryByText(Config.sectionHeaders.START)).toBeInTheDocument();
  });
});
