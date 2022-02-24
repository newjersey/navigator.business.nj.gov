import { NavBar } from "@/components/navbar/NavBar";
import { OperateReference } from "@/lib/types/types";
import { generateRoadmap, generateStep, generateTask, generateUser } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, RenderResult, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ReactNode } from "react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("next/router");
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("next/link", () => {
  return ({ children }: { children: ReactNode }) => {
    return children;
  };
});

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

describe("<NavBar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("navbar - used when user is on landing page", () => {
    it("displays landing page navbar when prop is passed", () => {
      const subject = render(
        <NavBar landingPage={true} task={undefined} sideBarPageLayout={false} operateReferences={{}} />
      );
      expect(subject.getByText(Defaults.navigationDefaults.registerButton)).toBeInTheDocument();
    });
  });

  const displaysUserNameOrEmail = (renderFunc: () => RenderResult) => {
    it("displays name of user if available", () => {
      useMockUserData({ user: generateUser({ name: "John Smith", email: "test@example.com" }) });
      const subject = renderFunc();
      expect(subject.getByText("John Smith")).toBeInTheDocument();
      expect(subject.queryByText("test@example.com")).not.toBeInTheDocument();
    });

    it("displays email of user if no name available", () => {
      useMockUserData({ user: generateUser({ name: undefined, email: "test@example.com" }) });
      const subject = renderFunc();
      expect(subject.getByText("test@example.com")).toBeInTheDocument();
    });

    it("displays default text if no user data", () => {
      useUndefinedUserData();
      const subject = renderFunc();
      expect(subject.getAllByText(Defaults.navigationDefaults.myNJAccountText).length).toBeGreaterThan(0);
    });
  };

  describe("desktop navbar", () => {
    const renderDesktopNav = (): RenderResult => {
      setLargeScreen(true);
      return render(
        <NavBar landingPage={false} task={undefined} sideBarPageLayout={false} operateReferences={{}} />
      );
    };

    displaysUserNameOrEmail(renderDesktopNav);

    it("displays a closed dropdown menu on the NavBar", () => {
      const user = { name: "John Smith", email: "test@example.com" };

      useMockUserData({
        user: generateUser(user),
      });
      const subject = renderDesktopNav();
      const menuEl = subject.getByText(user.name);
      expect(menuEl).toBeInTheDocument();
      expect(subject.queryByText(Defaults.navigationDefaults.logoutButton)).not.toBeInTheDocument();
      expect(subject.queryByText(Defaults.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      const user = { name: "John Smith", email: "test@example.com" };
      useMockUserData({
        user: generateUser(user),
      });
      const subject = renderDesktopNav();
      const menuEl = subject.getByText(user.name);

      userEvent.click(menuEl);
      expect(subject.getByText(Defaults.navigationDefaults.logoutButton)).toBeInTheDocument();
      expect(subject.getByText(Defaults.navigationDefaults.myNJAccountText)).toBeInTheDocument();

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(subject.queryByText(Defaults.navigationDefaults.logoutButton)).not.toBeInTheDocument();
        expect(subject.queryByText(Defaults.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
      });
    });
  });

  describe("mobile navbar - doesn't render roadmap within drawer", () => {
    const renderMobileRoadmapNav = (): RenderResult => {
      setLargeScreen(false);
      const subject = render(
        <NavBar landingPage={false} task={undefined} sideBarPageLayout={false} operateReferences={{}} />
      );
      fireEvent.click(subject.getByTestId("nav-menu-open"));
      return subject;
    };

    displaysUserNameOrEmail(renderMobileRoadmapNav);

    it("does not display mini-roadmap", () => {
      useMockUserData({});
      useMockRoadmap(generateRoadmap({ steps: [generateStep({ name: "step1" })] }));
      const subject = renderMobileRoadmapNav();
      expect(subject.queryByText("step1")).not.toBeInTheDocument();
    });

    it("does not display operate section", () => {
      useMockUserData({});
      const subject = renderMobileRoadmapNav();
      const sectionName = Defaults.sectionHeaders.OPERATE.toLowerCase();
      expect(subject.queryByTestId(`section-${sectionName}`)).not.toBeInTheDocument();
    });
  });

  describe("mobile navbar - renders roadmap within drawer", () => {
    beforeEach(() => {
      useMockRouter({});
      useMockRoadmap({});
    });

    const renderMobileTaskNav = (config?: { includeOperateRef: boolean }): RenderResult => {
      setLargeScreen(false);

      const operateRef: Record<string, OperateReference> = {
        "some-tax-filing-identifier-1": {
          name: "some-filing-name-1",
          urlSlug: "some-urlSlug-1",
          urlPath: "some-path",
        },
      };

      const subject = render(
        <NavBar
          landingPage={false}
          task={generateTask({})}
          sideBarPageLayout={true}
          operateReferences={config?.includeOperateRef ? operateRef : undefined}
        />
      );
      fireEvent.click(subject.getByTestId("nav-menu-open"));
      return subject;
    };

    displaysUserNameOrEmail(renderMobileTaskNav);

    it("displays mini-roadmap with PLAN/START when operateReferences does not exist", () => {
      useMockUserData({});
      useMockRoadmap(
        generateRoadmap({
          steps: [
            generateStep({ name: "step1", section: "PLAN" }),
            generateStep({ name: "step2", section: "START" }),
          ],
        })
      );
      const subject = renderMobileTaskNav();
      expect(subject.queryByText("step1")).toBeInTheDocument();
      expect(subject.queryByText(Defaults.sectionHeaders.PLAN)).toBeInTheDocument();
      expect(subject.queryByText(Defaults.sectionHeaders.START)).toBeInTheDocument();
      expect(subject.queryByText(Defaults.sectionHeaders.OPERATE)).not.toBeInTheDocument();
    });

    it("displays mini-roadmap with OPERATE when operateReferences does exists", () => {
      useMockUserData({});
      useMockRoadmap(
        generateRoadmap({
          steps: [
            generateStep({ name: "step1", section: "PLAN" }),
            generateStep({ name: "step2", section: "START" }),
          ],
        })
      );

      const subject = renderMobileTaskNav({ includeOperateRef: true });
      expect(subject.queryByText(Defaults.sectionHeaders.OPERATE)).toBeInTheDocument();
      expect(subject.queryByText("step1")).not.toBeInTheDocument();
      expect(subject.queryByText(Defaults.sectionHeaders.PLAN)).not.toBeInTheDocument();
      expect(subject.queryByText(Defaults.sectionHeaders.START)).not.toBeInTheDocument();
    });

    it("hide drawer when mini-roadmap task is clicked", async () => {
      useMockUserData({});
      useMockRoadmap(
        generateRoadmap({
          steps: [generateStep({ name: "step1", tasks: [generateTask({ name: "task1" })] })],
        })
      );
      const subject = renderMobileTaskNav();
      fireEvent.click(subject.getByText("step1"));
      fireEvent.click(subject.getByText("task1"));

      await waitForElementToBeRemoved(() => subject.queryByTestId("nav-sidebar-menu"));
      expect(subject.queryByText("task1")).not.toBeInTheDocument();
      expect(subject.queryByTestId("nav-sidebar-menu")).not.toBeInTheDocument();
    });

    it("opens and closes user profile links", async () => {
      useMockUserData({ user: generateUser({ name: "Grace Hopper" }) });
      const subject = renderMobileTaskNav();
      expect(subject.queryByText(Defaults.navigationDefaults.myNJAccountText)).not.toBeVisible();
      expect(subject.queryByText(Defaults.navigationDefaults.profileLinkText)).not.toBeVisible();

      fireEvent.click(subject.getByText("Grace Hopper"));
      expect(subject.queryByText(Defaults.navigationDefaults.myNJAccountText)).toBeVisible();
      expect(subject.queryByText(Defaults.navigationDefaults.profileLinkText)).toBeVisible();

      fireEvent.click(subject.getByText("Grace Hopper"));
      await waitFor(() => {
        expect(subject.queryByText(Defaults.navigationDefaults.myNJAccountText)).not.toBeVisible();
        expect(subject.queryByText(Defaults.navigationDefaults.profileLinkText)).not.toBeVisible();
      });
    });

    it("hide drawer when filings task is clicked when operate refs exist", async () => {
      useMockUserData({});

      const subject = renderMobileTaskNav({ includeOperateRef: true });
      fireEvent.click(subject.getByTestId("some-filing-name-1"));

      await waitForElementToBeRemoved(() => subject.queryByTestId("nav-sidebar-menu"));
      expect(subject.queryByText("some-filing-name-1")).not.toBeInTheDocument();
      expect(subject.queryByTestId("nav-sidebar-menu")).not.toBeInTheDocument();
    });
  });
});
