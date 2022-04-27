import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
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
    useMockUserData({});
    (useMediaQuery as jest.Mock).mockImplementation(() => true); // set large screen
  });

  it("links back to /roadmap when user is starting a business", () => {
    useMockProfileData({ hasExistingBusiness: false });
    const subject = render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(subject.queryByText("stuff")).toBeInTheDocument();
    expect(subject.getByTestId("back-to-roadmap").getAttribute("href")).toEqual("/roadmap");
  });

  it("links back to /dashboard when user owns a business", () => {
    useMockProfileData({ hasExistingBusiness: true });
    const subject = render(<SidebarPageLayout>stuff</SidebarPageLayout>);
    expect(subject.getByTestId("back-to-roadmap").getAttribute("href")).toEqual("/dashboard");
  });

  it("shows content in sidebar", () => {
    const subject = render(
      <SidebarPageLayout navChildren={<div>{"roflcopter"}</div>}>stuff</SidebarPageLayout>
    );
    expect(subject.queryByText("roflcopter")).toBeInTheDocument();
  });
});
