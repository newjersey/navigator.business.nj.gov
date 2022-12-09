import { NavBar } from "@/components/navbar/NavBar";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import {
  generateRoadmap,
  generateStep,
  generateTask,
  generateUser,
  generateUserData,
} from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData, useUndefinedUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode } from "react";

const Config = getMergedConfig();

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock(
  "next/link",
  () =>
    ({ children }: { children: ReactNode }) =>
      children
);

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

      render(<NavBar landingPage={true} />);
      expect(screen.getByText(Config.navigationDefaults.registerButton)).toBeInTheDocument();
    });

    it("goes to onboarding when signup is clicked", () => {
      setLargeScreen(true);

      render(<NavBar landingPage={true} />);

      fireEvent.click(screen.getByText(Config.navigationDefaults.registerButton));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.onboarding);
    });
  });

  describe("navbar - used when user is onboarding", () => {
    beforeEach(() => {
      useMockUserData({});
      useMockRouter({ pathname: ROUTES.onboarding });
    });

    describe("desktop version", () => {
      const renderDesktopNav = () => {
        setLargeScreen(true);
        render(
          withAuth(<NavBar landingPage={false} showSidebar={false} />, {
            isAuthenticated: IsAuthenticated.FALSE,
          })
        );
      };

      it("renders the log in button", async () => {
        renderDesktopNav();
        expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
      });

      it("doesn't render register button", () => {
        renderDesktopNav();
        expect(screen.queryByTestId("registration-button")).not.toBeInTheDocument();
      });

      it("doesn't render a menu to be opened", async () => {
        renderDesktopNav();
        const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);
        fireEvent.click(menuEl);
        await waitFor(() => {
          expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
        });
      });
    });

    describe("mobile version", () => {
      const renderMobileRoadmapNav = () => {
        setLargeScreen(false);
        render(
          withAuth(<NavBar landingPage={false} showSidebar={false} />, {
            isAuthenticated: IsAuthenticated.FALSE,
          })
        );
        fireEvent.click(screen.getByTestId("nav-menu-open"));
      };

      it("renders the log in button", async () => {
        renderMobileRoadmapNav();
        expect(screen.getByText(Config.navigationDefaults.logInButton)).toBeInTheDocument();
      });

      it("doesn't render register and profile text", async () => {
        renderMobileRoadmapNav();
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
        expect(screen.queryByText(Config.navigationDefaults.registerButton)).not.toBeInTheDocument();
      });
    });
  });

  const displaysUserNameOrEmail = (renderFunc: () => void) => {
    it("displays name of user if available", () => {
      useMockUserData({ user: generateUser({ name: "John Smith", email: "test@example.com" }) });
      renderFunc();
      expect(screen.getByText("John Smith")).toBeInTheDocument();
      expect(screen.queryByText("test@example.com")).not.toBeInTheDocument();
    });

    it("displays email of user if no name available", () => {
      useMockUserData({ user: generateUser({ name: undefined, email: "test@example.com" }) });
      renderFunc();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });

    it("displays default text if no user data", () => {
      useUndefinedUserData();
      renderFunc();
      expect(screen.getAllByText(Config.navigationDefaults.myNJAccountText).length).toBeGreaterThan(0);
    });
  };

  describe("authenticated desktop navbar", () => {
    const renderDesktopNav = () => {
      setLargeScreen(true);
      render(
        withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.TRUE,
        })
      );
    };

    displaysUserNameOrEmail(renderDesktopNav);

    it("doesn't display registration button when user is authenticated", async () => {
      useMockUserData({});
      renderDesktopNav();
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
    });

    it("doesn't display log in button when user is authenticated", async () => {
      useMockUserData({});
      renderDesktopNav();
      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();
    });

    it("displays a closed dropdown menu on the NavBar", () => {
      const user = { name: "John Smith", email: "test@example.com" };

      useMockUserData({
        user: generateUser(user),
      });
      renderDesktopNav();
      const menuEl = screen.getByText(user.name);
      expect(menuEl).toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      const user = { name: "John Smith", email: "test@example.com" };

      useMockUserData({
        user: generateUser(user),
      });

      renderDesktopNav();

      await waitFor(() => {
        expect(screen.getByText(user.name)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();

      const menuEl = screen.getByText(user.name);

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
      });
      expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
    });
  });

  describe("guest mode desktop navbar", () => {
    const renderDesktopNav = () => {
      setLargeScreen(true);
      render(
        withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.FALSE,
        })
      );
    };

    it("displays registration button only when isAuthenticated is false", async () => {
      useMockUserData({});
      renderDesktopNav();
      expect(screen.getByTestId("registration-button")).toBeInTheDocument();
    });

    it("displays log in button only when isAuthenticated is false", async () => {
      useMockUserData({});
      renderDesktopNav();
      expect(screen.getByTestId("login-button")).toBeInTheDocument();
    });

    it("displays business profile button only when the menu is open", async () => {
      useMockUserData({});
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);
      userEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });
      userEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });
    });

    it("displays a closed dropdown menu on the NavBar", () => {
      useMockUserData({});
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);
      expect(menuEl).toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      useMockUserData({});
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });
    });

    it("sends user to selfRegistration when registration button is clicked", async () => {
      setLargeScreen(true);
      setupStatefulUserDataContext();
      const user = generateUser({ name: "John Smith", email: "test@example.com" });
      const userData = generateUserData({ user });
      render(
        withAuth(
          <WithStatefulUserData initialUserData={userData}>
            <NavBar landingPage={false} showSidebar={false} />
          </WithStatefulUserData>,
          { user, isAuthenticated: IsAuthenticated.FALSE }
        )
      );
      fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestText));

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

      fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText));

      await waitFor(() => {
        expect(mockApi.postSelfReg).toHaveBeenCalledWith(userData);
      });
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe("mobile navbar - non-sidebar view", () => {
    const renderMobileRoadmapNav = () => {
      setLargeScreen(false);
      render(
        withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.TRUE,
        })
      );
      fireEvent.click(screen.getByTestId("nav-menu-open"));
    };

    displaysUserNameOrEmail(renderMobileRoadmapNav);

    it("does not display mini-roadmap", () => {
      useMockUserData({});
      useMockRoadmap(generateRoadmap({ steps: [generateStep({ name: "step1" })] }));
      renderMobileRoadmapNav();
      expect(screen.queryByText("step1")).not.toBeInTheDocument();
    });
  });

  describe("mobile navbar - sidebar view", () => {
    beforeEach(() => {
      useMockRouter({});
      useMockRoadmap({});
    });

    const renderMobileTaskNav = (isAuthenticated = IsAuthenticated.TRUE) => {
      setLargeScreen(false);

      render(
        withAuth(<NavBar landingPage={false} task={generateTask({})} showSidebar={true} />, {
          isAuthenticated,
        })
      );
      fireEvent.click(screen.getByTestId("nav-menu-open"));
    };

    describe("authenticated mobile navbar - renders roadmap within drawer", () => {
      displaysUserNameOrEmail(() => {
        return renderMobileTaskNav(IsAuthenticated.TRUE);
      });

      it("displays user profile links", async () => {
        useMockUserData({ user: generateUser({ name: "Grace Hopper" }) });
        renderMobileTaskNav(IsAuthenticated.TRUE);

        expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).toBeVisible();
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).toBeVisible();
      });
    });

    describe("guest mode mobile navbar - renders roadmap within drawer", () => {
      it("displays user registration links", async () => {
        useMockUserData({});
        renderMobileTaskNav(IsAuthenticated.FALSE);

        expect(screen.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeVisible();
      });

      it("sends user to selfRegistration when registration button is clicked", async () => {
        setLargeScreen(false);
        setupStatefulUserDataContext();
        const user = generateUser({ name: "John Smith", email: "test@example.com" });
        const userData = generateUserData({ user });
        render(
          withAuth(
            <WithStatefulUserData initialUserData={userData}>
              <NavBar landingPage={false} task={undefined} showSidebar={false} />
            </WithStatefulUserData>,
            { user, isAuthenticated: IsAuthenticated.FALSE }
          )
        );
        fireEvent.click(screen.getByTestId("nav-menu-open"));
        fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestText));

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

        fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText));

        await waitFor(() => {
          expect(mockApi.postSelfReg).toHaveBeenCalledWith(userData);
        });
        expect(mockPush).toHaveBeenCalled();
      });

      it("displays mini-roadmap with PLAN/START when hideMiniRoadmap does not exist", () => {
        useMockUserData({});
        useMockRoadmap(
          generateRoadmap({
            steps: [
              generateStep({ name: "step1", section: "PLAN" }),
              generateStep({ name: "step2", section: "START" }),
            ],
          })
        );
        renderMobileTaskNav();
        expect(screen.getByText("step1")).toBeInTheDocument();
        expect(screen.getByText(Config.sectionHeaders.PLAN)).toBeInTheDocument();
        expect(screen.getByText(Config.sectionHeaders.START)).toBeInTheDocument();
      });

      it("does not display mini-roadmap when hideMiniRoadmap is true", () => {
        useMockUserData({});
        useMockRoadmap(
          generateRoadmap({
            steps: [
              generateStep({ name: "step1", section: "PLAN" }),
              generateStep({ name: "step2", section: "START" }),
            ],
          })
        );

        render(
          withAuth(
            <NavBar landingPage={false} task={generateTask({})} showSidebar={true} hideMiniRoadmap={true} />,
            { isAuthenticated: IsAuthenticated.TRUE }
          )
        );
        fireEvent.click(screen.getByTestId("nav-menu-open"));

        expect(screen.queryByText("step1")).not.toBeInTheDocument();
        expect(screen.queryByText(Config.sectionHeaders.PLAN)).not.toBeInTheDocument();
        expect(screen.queryByText(Config.sectionHeaders.START)).not.toBeInTheDocument();
      });

      it("hide drawer when mini-roadmap task is clicked", async () => {
        useMockUserData({});
        useMockRoadmap(
          generateRoadmap({
            steps: [generateStep({ name: "step1", stepNumber: 1 })],
            tasks: [generateTask({ name: "task1", stepNumber: 1 })],
          })
        );
        renderMobileTaskNav();
        fireEvent.click(screen.getByText("step1"));
        fireEvent.click(screen.getByText("task1"));

        await waitForElementToBeRemoved(() => {
          return screen.queryByTestId("nav-sidebar-menu");
        });
        expect(screen.queryByText("task1")).not.toBeInTheDocument();
        expect(screen.queryByTestId("nav-sidebar-menu")).not.toBeInTheDocument();
      });
    });
  });
});
