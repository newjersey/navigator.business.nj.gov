import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { generateOperateReference, generateStep, generateUserData } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { render, screen } from "@testing-library/react";
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

describe("<TaskSidebarPageLayout />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData(generateUserData({}));
    useMockRoadmap({
      steps: [generateStep({ section: "PLAN" }), generateStep({ section: "START" })],
    });
    (useMediaQuery as jest.Mock).mockImplementation(() => true); // set large screen
  });

  it("shows only operate section when there are operateReferences", () => {
    const operateReferences = { "some-id": generateOperateReference({}) };
    render(<TaskSidebarPageLayout operateReferences={operateReferences}>stuff</TaskSidebarPageLayout>);
    expect(screen.getByText(Config.sectionHeaders.OPERATE)).toBeInTheDocument();
    expect(screen.queryByText(Config.sectionHeaders.PLAN)).not.toBeInTheDocument();
    expect(screen.queryByText(Config.sectionHeaders.START)).not.toBeInTheDocument();
  });

  it("shows only plan/start sections when there are no operateReferences", () => {
    render(<TaskSidebarPageLayout>stuff</TaskSidebarPageLayout>);
    expect(screen.queryByText(Config.sectionHeaders.OPERATE)).not.toBeInTheDocument();
    expect(screen.getByText(Config.sectionHeaders.PLAN)).toBeInTheDocument();
    expect(screen.getByText(Config.sectionHeaders.START)).toBeInTheDocument();
  });
});
