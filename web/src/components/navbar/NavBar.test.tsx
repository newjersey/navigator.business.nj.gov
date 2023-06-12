import { NavBar } from "@/components/navbar/NavBar";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { generateRoadmap, generateStep, generateTask } from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { setupStatefulUserDataContext, WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import {
  generateProfileData,
  generateUser,
  generateUserData,
  UserData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
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
    ({ children }: { children: ReactNode }): ReactNode =>
      children
);

const setLargeScreen = (value: boolean): void => {
  (useMediaQuery as jest.Mock).mockImplementation(() => value);
};

const generateOnboardingUser = (): UserData => {
  return generateUserData({
    profileData: generateProfileData({
      businessName: "",
      industryId: undefined,
      legalStructureId: undefined,
    }),
  });
};

const generateGuestUserData = (overrides?: Partial<UserData>): UserData => {
  return generateUserData({
    profileData: generateProfileData({
      businessName: "",
      industryId: "cannabis",
      legalStructureId: "limited-liability-company",
    }),
    ...overrides,
  });
};

const businessName = "businessName";

const generateBusinessNamedUserData = (overrides?: Partial<UserData>): UserData => {
  return generateUserData({
    profileData: generateProfileData({
      businessName: businessName,
      industryId: "cannabis",
      legalStructureId: "limited-liability-company",
    }),
    ...overrides,
  });
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
      useMockUserData(generateOnboardingUser());
      useMockRouter({ pathname: ROUTES.onboarding });
    });

    describe("desktop version", () => {
      const renderDesktopNav = (): void => {
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
      const renderMobileRoadmapNav = (): void => {
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
        useMockRouter({ pathname: ROUTES.onboarding });
        renderMobileRoadmapNav();
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
        expect(screen.queryByText(Config.navigationDefaults.registerButton)).not.toBeInTheDocument();
      });
    });
  });

  describe("authenticated desktop navbar", () => {
    const renderDesktopNav = (): void => {
      setLargeScreen(true);
      render(
        withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.TRUE,
        })
      );
    };

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

    it("displays myNJ button when user is authenticated", async () => {
      useMockUserData({});
      renderDesktopNav();
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
    });

    it("displays log out button when user is authenticated", async () => {
      useMockUserData({});
      renderDesktopNav();
      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();
    });

    it("displays a closed dropdown menu on the NavBar", () => {
      useMockUserData(generateBusinessNamedUserData());

      renderDesktopNav();
      const menuEl = screen.getByText(businessName);
      expect(menuEl).toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      useMockUserData(generateBusinessNamedUserData());

      renderDesktopNav();

      await waitFor(() => {
        expect(screen.getByText(businessName)).toBeInTheDocument();
      });
      expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();

      const menuEl = screen.getByText(businessName);
      fireEvent.click(menuEl);

      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
      });
      expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
    });
  });

  describe("guest mode desktop navbar", () => {
    const renderDesktopNav = (): void => {
      setLargeScreen(true);
      render(
        withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.FALSE,
        })
      );
    };

    it("displays registration button only when isAuthenticated is false", async () => {
      useMockUserData(generateGuestUserData());
      renderDesktopNav();
      expect(screen.getByTestId("registration-button")).toBeInTheDocument();
    });

    it("displays log in button only when isAuthenticated is false", async () => {
      useMockUserData(generateGuestUserData());
      renderDesktopNav();
      expect(screen.getByTestId("login-button")).toBeInTheDocument();
    });

    it("displays business profile button only when the menu is open", async () => {
      useMockUserData(generateBusinessNamedUserData());
      renderDesktopNav();
      const menuEl = screen.getByText(businessName);
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });
    });

    it("displays business name title within menu", async () => {
      useMockUserData(generateBusinessNamedUserData());
      renderDesktopNav();
      const menuEl = screen.getByText(businessName);
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(within(menuEl).getByText(businessName)).toBeInTheDocument();
      });
    });

    it("displays a closed dropdown menu on the NavBar", () => {
      useMockUserData(generateBusinessNamedUserData());
      renderDesktopNav();
      const menuEl = screen.getByText(businessName);
      expect(menuEl).toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      useMockUserData(generateBusinessNamedUserData());
      renderDesktopNav();
      const menuEl = screen.getByText(businessName);

      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });

      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });
    });

    it("sends user to selfRegistration when registration button is clicked", async () => {
      setLargeScreen(true);
      setupStatefulUserDataContext();
      const user = generateUser({ name: "John Smith", email: "test@example.com" });
      const userData = generateBusinessNamedUserData({ user });

      render(
        withAuth(
          <WithStatefulUserData initialUserData={userData}>
            <NavBar landingPage={false} showSidebar={false} />
          </WithStatefulUserData>,
          { user, isAuthenticated: IsAuthenticated.FALSE }
        )
      );
      fireEvent.click(screen.getByText(businessName));

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
    const renderMobileRoadmapNav = (): void => {
      setLargeScreen(false);
      render(
        withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.TRUE,
        })
      );
      fireEvent.click(screen.getByTestId("nav-menu-open"));
    };

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

    const renderMobileTaskNav = (navBarSettings: {
      isLanding?: boolean;
      isAuthenticated?: IsAuthenticated;
    }): void => {
      setLargeScreen(false);
      render(
        withAuth(
          <NavBar landingPage={navBarSettings.isLanding} task={generateTask({})} showSidebar={true} />,
          { isAuthenticated: navBarSettings.isAuthenticated ?? IsAuthenticated.FALSE }
        )
      );
      fireEvent.click(screen.getByTestId("nav-menu-open"));
    };

    describe("landing page mobile navbar", () => {
      it("doesn't display the account section", () => {
        useMockUserData({});
        renderMobileTaskNav({ isLanding: true });
        expect(screen.queryByText(Config.navigationDefaults.navBarGuestText)).not.toBeInTheDocument();
      });

      it("doesn't display the show business profile button", () => {
        useMockUserData({});
        renderMobileTaskNav({ isLanding: true });
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });

      it("displays the get started text instead of register for user registration", () => {
        useMockUserData({});
        renderMobileTaskNav({ isLanding: true });
        expect(screen.getByText(Config.navigationDefaults.registerButton)).toBeInTheDocument();
        expect(
          screen.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)
        ).not.toBeInTheDocument();
      });
    });

    describe("authenticated mobile navbar - renders roadmap within drawer", () => {
      it("displays user profile links", async () => {
        useMockUserData({ user: generateUser({ name: "Grace Hopper" }) });
        renderMobileTaskNav({ isAuthenticated: IsAuthenticated.TRUE });

        expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).toBeVisible();
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).toBeVisible();
      });
    });

    describe("guest mode mobile navbar - renders roadmap within drawer", () => {
      it("displays user registration links", async () => {
        useMockUserData({});
        renderMobileTaskNav({ isLanding: false, isAuthenticated: IsAuthenticated.FALSE });

        expect(screen.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeVisible();
      });

      it("displays login button", async () => {
        useMockUserData({});
        renderMobileTaskNav({ isAuthenticated: IsAuthenticated.FALSE });

        expect(screen.queryByText(Config.navigationDefaults.logInButton)).toBeVisible();
      });

      it("displays profile and dashboard buttons", async () => {
        useMockUserData(generateBusinessNamedUserData());
        renderMobileTaskNav({ isAuthenticated: IsAuthenticated.FALSE });

        expect(screen.queryByText(businessName)).toBeVisible();
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).toBeVisible();
      });

      it("sends user to selfRegistration when registration button is clicked", async () => {
        setLargeScreen(false);
        setupStatefulUserDataContext();
        const user = generateUser({ name: "John Smith", email: "test@example.com" });
        const userData = generateGuestUserData({ user });

        render(
          withAuth(
            <WithStatefulUserData initialUserData={userData}>
              <NavBar landingPage={false} task={undefined} showSidebar={false} />
            </WithStatefulUserData>,
            { user, isAuthenticated: IsAuthenticated.FALSE }
          )
        );
        fireEvent.click(screen.getByTestId("nav-menu-open"));

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
        renderMobileTaskNav({});
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
        renderMobileTaskNav({});
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
