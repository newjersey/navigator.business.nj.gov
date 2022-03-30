import { NavBar } from "@/components/navbar/NavBar";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { OperateReference } from "@/lib/types/types";
import {
  generateRoadmap,
  generateStep,
  generateTask,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { withAuth } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
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

const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router");
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
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
    useMockRouter({});
  });

  describe("navbar - used when user is on landing page", () => {
    it("displays landing page navbar when prop is passed", () => {
      setLargeScreen(true);

      const subject = render(
        <NavBar
          landingPage={true}
          task={undefined}
          sideBarPageLayout={false}
          operateReferences={{}}
          isWidePage={false}
        />
      );
      expect(subject.getByText(Config.navigationDefaults.registerButton)).toBeInTheDocument();
    });

    it("goes to onboarding when signup is clicked", () => {
      setLargeScreen(true);

      const subject = render(
        <NavBar
          landingPage={true}
          task={undefined}
          sideBarPageLayout={false}
          operateReferences={{}}
          isWidePage={false}
        />
      );

      fireEvent.click(subject.getByText(Config.navigationDefaults.registerButton));
      expect(mockPush).toHaveBeenCalledWith("/onboarding");
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
      expect(subject.getAllByText(Config.navigationDefaults.myNJAccountText).length).toBeGreaterThan(0);
    });
  };

  describe("authenticated desktop navbar", () => {
    const renderDesktopNav = (): RenderResult => {
      setLargeScreen(true);
      return render(
        withAuth(
          <NavBar landingPage={false} task={undefined} sideBarPageLayout={false} operateReferences={{}} />,
          { isAuthenticated: IsAuthenticated.TRUE }
        )
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
      expect(subject.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();
      expect(subject.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      const user = { name: "John Smith", email: "test@example.com" };

      useMockUserData({
        user: generateUser(user),
      });

      const subject = renderDesktopNav();
      const menuEl = subject.getByText(user.name);

      userEvent.click(menuEl);
      expect(subject.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
      expect(subject.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(subject.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();
        expect(subject.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
      });
    });
  });

  describe("guest mode desktop navbar", () => {
    const renderDesktopNav = (): RenderResult => {
      setLargeScreen(true);
      return render(
        withAuth(
          <NavBar landingPage={false} task={undefined} sideBarPageLayout={false} operateReferences={{}} />,
          { isAuthenticated: IsAuthenticated.FALSE }
        )
      );
    };

    it("displays a closed dropdown menu on the NavBar", () => {
      useMockUserData({});
      const subject = renderDesktopNav();
      const menuEl = subject.getByText(Config.navigationDefaults.navBarGuestText);
      expect(menuEl).toBeInTheDocument();
      expect(
        subject.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)
      ).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      useMockUserData({});
      const subject = renderDesktopNav();
      const menuEl = subject.getByText(Config.navigationDefaults.navBarGuestText);

      userEvent.click(menuEl);
      expect(subject.getByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeInTheDocument();

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(
          subject.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)
        ).not.toBeInTheDocument();
      });
    });

    it("sends user to selfRegistration when registration button is clicked", async () => {
      setLargeScreen(true);
      setupStatefulUserDataContext();
      const user = generateUser({ name: "John Smith", email: "test@example.com" });
      const userData = generateUserData({ user });
      const subject = render(
        withAuth(
          <WithStatefulUserData initialUserData={userData}>
            <NavBar landingPage={false} task={undefined} sideBarPageLayout={false} operateReferences={{}} />
          </WithStatefulUserData>,
          { user, isAuthenticated: IsAuthenticated.FALSE }
        )
      );
      fireEvent.click(subject.getByText(Config.navigationDefaults.navBarGuestText));

      const businessUser = {
        ...user,
        email: "email@example.com",
        name: "My Name",
        receiveNewsletter: false,
        userTesting: true,
      };

      mockApi.postSelfReg.mockResolvedValue({
        authRedirectURL: "www.example.com",
        userData: { ...userData, user: businessUser },
      });

      fireEvent.click(subject.getByText(Config.navigationDefaults.navBarGuestRegistrationText));

      await waitFor(() => {
        expect(mockApi.postSelfReg).toHaveBeenCalledWith(userData);
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("mobile navbar - doesn't render roadmap within drawer", () => {
    const renderMobileRoadmapNav = (): RenderResult => {
      setLargeScreen(false);
      const subject = render(
        withAuth(
          <NavBar landingPage={false} task={undefined} sideBarPageLayout={false} operateReferences={{}} />,
          { isAuthenticated: IsAuthenticated.TRUE }
        )
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
      const sectionName = Config.sectionHeaders.OPERATE.toLowerCase();
      expect(subject.queryByTestId(`section-${sectionName}`)).not.toBeInTheDocument();
    });
  });

  describe("mobile navbar - renders roadmap within drawer", () => {
    beforeEach(() => {
      useMockRouter({});
      useMockRoadmap({});
    });

    const renderMobileTaskNav =
      (isAuthenticated = IsAuthenticated.TRUE) =>
      (config?: { includeOperateRef: boolean }): RenderResult => {
        setLargeScreen(false);

        const operateRef: Record<string, OperateReference> = {
          "some-tax-filing-identifier-1": {
            name: "some-filing-name-1",
            urlSlug: "some-urlSlug-1",
            urlPath: "some-path",
          },
        };

        const subject = render(
          withAuth(
            <NavBar
              landingPage={false}
              task={generateTask({})}
              sideBarPageLayout={true}
              operateReferences={config?.includeOperateRef ? operateRef : undefined}
            />,
            { isAuthenticated }
          )
        );
        fireEvent.click(subject.getByTestId("nav-menu-open"));
        return subject;
      };

    describe("authenticated mobile navbar - renders roadmap within drawer", () => {
      displaysUserNameOrEmail(renderMobileTaskNav(IsAuthenticated.TRUE));
      it("opens and closes user profile links", async () => {
        useMockUserData({ user: generateUser({ name: "Grace Hopper" }) });
        const subject = renderMobileTaskNav(IsAuthenticated.TRUE)();
        expect(subject.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeVisible();
        expect(subject.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeVisible();

        fireEvent.click(subject.getByText("Grace Hopper"));
        expect(subject.queryByText(Config.navigationDefaults.myNJAccountText)).toBeVisible();
        expect(subject.queryByText(Config.navigationDefaults.profileLinkText)).toBeVisible();

        fireEvent.click(subject.getByText("Grace Hopper"));
        await waitFor(() => {
          expect(subject.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeVisible();
          expect(subject.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeVisible();
        });
      });
    });
    describe("guest mode mobile navbar - renders roadmap within drawer", () => {
      it("opens and closes user registration links", async () => {
        useMockUserData({});
        const subject = renderMobileTaskNav(IsAuthenticated.FALSE)();
        expect(subject.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)).not.toBeVisible();

        fireEvent.click(subject.getByText(Config.navigationDefaults.navBarGuestText));
        expect(subject.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeVisible();

        fireEvent.click(subject.getByText(Config.navigationDefaults.navBarGuestText));
        await waitFor(() => {
          expect(
            subject.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)
          ).not.toBeVisible();
        });
      });

      it("sends user to selfRegistration when registration button is clicked", async () => {
        setLargeScreen(false);
        setupStatefulUserDataContext();
        const user = generateUser({ name: "John Smith", email: "test@example.com" });
        const userData = generateUserData({ user });
        const subject = render(
          withAuth(
            <WithStatefulUserData initialUserData={userData}>
              <NavBar landingPage={false} task={generateTask({})} sideBarPageLayout={true} />
            </WithStatefulUserData>,
            { user, isAuthenticated: IsAuthenticated.FALSE }
          )
        );
        fireEvent.click(subject.getByTestId("nav-menu-open"));
        fireEvent.click(subject.getByText(Config.navigationDefaults.navBarGuestText));

        const businessUser = {
          ...user,
          email: "email@example.com",
          name: "My Name",
          receiveNewsletter: false,
          userTesting: true,
        };

        mockApi.postSelfReg.mockResolvedValue({
          authRedirectURL: "www.example.com",
          userData: { ...userData, user: businessUser },
        });

        fireEvent.click(subject.getByText(Config.navigationDefaults.navBarGuestRegistrationText));

        await waitFor(() => {
          expect(mockApi.postSelfReg).toHaveBeenCalledWith(userData);
          expect(mockPush).toHaveBeenCalled();
        });
      });
    });

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
      const subject = renderMobileTaskNav()();
      expect(subject.queryByText("step1")).toBeInTheDocument();
      expect(subject.queryByText(Config.sectionHeaders.PLAN)).toBeInTheDocument();
      expect(subject.queryByText(Config.sectionHeaders.START)).toBeInTheDocument();
      expect(subject.queryByText(Config.sectionHeaders.OPERATE)).not.toBeInTheDocument();
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

      const subject = renderMobileTaskNav()({ includeOperateRef: true });
      expect(subject.queryByText(Config.sectionHeaders.OPERATE)).toBeInTheDocument();
      expect(subject.queryByText("step1")).not.toBeInTheDocument();
      expect(subject.queryByText(Config.sectionHeaders.PLAN)).not.toBeInTheDocument();
      expect(subject.queryByText(Config.sectionHeaders.START)).not.toBeInTheDocument();
    });

    it("hide drawer when mini-roadmap task is clicked", async () => {
      useMockUserData({});
      useMockRoadmap(
        generateRoadmap({
          steps: [generateStep({ name: "step1", tasks: [generateTask({ name: "task1" })] })],
        })
      );
      const subject = renderMobileTaskNav()();
      fireEvent.click(subject.getByText("step1"));
      fireEvent.click(subject.getByText("task1"));

      await waitForElementToBeRemoved(() => subject.queryByTestId("nav-sidebar-menu"));
      expect(subject.queryByText("task1")).not.toBeInTheDocument();
      expect(subject.queryByTestId("nav-sidebar-menu")).not.toBeInTheDocument();
    });

    it("hide drawer when filings task is clicked when operate refs exist", async () => {
      useMockUserData({});

      const subject = renderMobileTaskNav()({ includeOperateRef: true });
      fireEvent.click(subject.getByTestId("some-filing-name-1"));

      await waitForElementToBeRemoved(() => subject.queryByTestId("nav-sidebar-menu"));
      expect(subject.queryByText("some-filing-name-1")).not.toBeInTheDocument();
      expect(subject.queryByTestId("nav-sidebar-menu")).not.toBeInTheDocument();
    });
  });
});
