import { NavBar } from "@/components/navbar/NavBar";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import {
  generateRoadmap,
  generateStep,
  generateTask,
  randomPublicFilingLegalStructure,
} from "@/test/factories";
import { withAuth } from "@/test/helpers/helpers-renderers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { useMockBusiness, useMockUserData } from "@/test/mock/mockUseUserData";
import { WithStatefulUserData, setupStatefulUserDataContext } from "@/test/mock/withStatefulUserData";
import {
  Business,
  generateBusiness,
  generateProfileData,
  generateUser,
  generateUserData,
  generateUserDataForBusiness,
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

const generateOnboardingBusiness = (): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: "",
      tradeName: "",
      industryId: undefined,
      legalStructureId: undefined,
    }),
  });
};

const generateGuestBusiness = (overrides?: Partial<Business>): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: "",
      tradeName: "",
      industryId: "cannabis",
      legalStructureId: "limited-liability-company",
    }),
    ...overrides,
  });
};

const businessName = "businessName";

const generateBusinessNamedBusiness = (overrides?: Partial<Business>): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      businessName: businessName,
      tradeName: "",
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

  it("shows business name when showSidebar is true on mobile", () => {
    useMockBusiness(generateBusinessNamedBusiness());
    setLargeScreen(false);
    render(
      withAuth(<NavBar landingPage={false} task={undefined} showSidebar={true} />, {
        isAuthenticated: IsAuthenticated.TRUE,
      })
    );

    expect(screen.getByText(businessName)).toBeInTheDocument();
  });

  it("does not show business name when showSidebar is false on mobile", () => {
    useMockBusiness(generateBusinessNamedBusiness());
    setLargeScreen(false);
    render(
      withAuth(<NavBar landingPage={false} task={undefined} showSidebar={false} />, {
        isAuthenticated: IsAuthenticated.TRUE,
      })
    );

    expect(screen.queryByText(businessName)).not.toBeInTheDocument();
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
      useMockBusiness(generateOnboardingBusiness());
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

      it("does not render nav menu for an onboarding authenticated user", async () => {
        setLargeScreen(false);
        render(
          withAuth(<NavBar landingPage={false} showSidebar={false} />, {
            isAuthenticated: IsAuthenticated.TRUE,
          })
        );

        useMockRouter({ pathname: ROUTES.onboarding });

        await waitFor(() => {
          expect(screen.queryByTestId("nav-menu-open")).not.toBeInTheDocument();
        });
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
      useMockBusiness({});
      renderDesktopNav();
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
    });

    it("doesn't display log in button when user is authenticated", async () => {
      useMockBusiness({});
      renderDesktopNav();
      expect(screen.queryByText(Config.navigationDefaults.logInButton)).not.toBeInTheDocument();
    });

    it("displays myNJ button, log out, and Add New Business button when user is authenticated", async () => {
      useMockBusiness(generateBusinessNamedBusiness());
      renderDesktopNav();
      const menuEl = screen.getByText(businessName);
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.myNJAccountText)).toBeInTheDocument();
      });
      expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      expect(screen.getByText(Config.navigationDefaults.logoutButton)).toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      useMockBusiness(generateBusinessNamedBusiness());

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
      expect(screen.getByText(Config.navigationDefaults.addBusinessButton)).toBeInTheDocument();

      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.logoutButton)).not.toBeInTheDocument();
      });
      expect(screen.queryByText(Config.navigationDefaults.myNJAccountText)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.addBusinessButton)).not.toBeInTheDocument();
    });

    it("displays all businesses for user when opened", async () => {
      const firstBusiness = generateBusiness({
        profileData: generateProfileData({
          businessName: "first-biz",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      const secondBusiness = generateBusiness({
        profileData: generateProfileData({
          businessName: "second-biz",
          legalStructureId: randomPublicFilingLegalStructure(),
        }),
      });
      const userData = generateUserData({
        currentBusinessId: firstBusiness.id,
        businesses: {
          [firstBusiness.id]: firstBusiness,
          [secondBusiness.id]: secondBusiness,
        },
      });
      useMockUserData(userData);

      renderDesktopNav();

      await waitFor(() => {
        expect(screen.getByText("first-biz")).toBeInTheDocument();
      });

      expect(screen.queryByText("second-biz")).not.toBeInTheDocument();

      const menuEl = screen.getByText("first-biz");
      fireEvent.click(menuEl);

      await waitFor(() => {
        expect(screen.getByText("second-biz")).toBeInTheDocument();
      });
      expect(screen.getAllByText("first-biz")).toHaveLength(2);
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
      useMockBusiness(generateGuestBusiness());
      renderDesktopNav();
      expect(screen.getByTestId("registration-button")).toBeInTheDocument();
    });

    it("displays log in button only when isAuthenticated is false", async () => {
      useMockBusiness(generateGuestBusiness());
      renderDesktopNav();
      expect(screen.getByTestId("login-button")).toBeInTheDocument();
    });

    it("displays business profile button only when the menu is open", async () => {
      useMockBusiness(generateBusinessNamedBusiness());
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });
    });

    it("displays Guest business name title within menu", async () => {
      useMockBusiness(generateBusinessNamedBusiness());
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);
      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(within(menuEl).getByText(Config.navigationDefaults.navBarGuestText)).toBeInTheDocument();
      });
    });

    it("displays a closed dropdown menu on the NavBar", () => {
      useMockBusiness(generateBusinessNamedBusiness());
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);
      expect(menuEl).toBeInTheDocument();
      expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      useMockBusiness(generateBusinessNamedBusiness());
      renderDesktopNav();
      const menuEl = screen.getByText(Config.navigationDefaults.navBarGuestText);

      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.getByText(Config.navigationDefaults.profileLinkText)).toBeInTheDocument();
      });

      fireEvent.click(menuEl);
      await waitFor(() => {
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });
    });

    it("sends user to account-setup when registration button is clicked", async () => {
      setLargeScreen(true);
      useMockBusiness({});

      render(
        withAuth(<NavBar landingPage={false} showSidebar={false} />, {
          isAuthenticated: IsAuthenticated.FALSE,
        })
      );
      fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestText));
      fireEvent.click(screen.getByText(Config.navigationDefaults.navBarGuestRegistrationText));
      expect(mockPush).toHaveBeenCalledWith(ROUTES.accountSetup);
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
      useMockBusiness({});
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
        useMockBusiness({});
        renderMobileTaskNav({ isLanding: true, isAuthenticated: IsAuthenticated.TRUE });
        expect(screen.queryByText(Config.navigationDefaults.navBarGuestText)).not.toBeInTheDocument();
      });

      it("doesn't display the show business profile button", () => {
        useMockBusiness({});
        renderMobileTaskNav({ isLanding: true });
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).not.toBeInTheDocument();
      });

      it("displays the get started text instead of register for user registration", () => {
        useMockBusiness({});
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
        expect(screen.queryByText(Config.navigationDefaults.addBusinessButton)).toBeVisible();
      });
    });

    describe("guest mode mobile navbar - renders roadmap within drawer", () => {
      it("displays user registration links", async () => {
        useMockBusiness({});
        renderMobileTaskNav({ isLanding: false, isAuthenticated: IsAuthenticated.FALSE });

        expect(screen.queryByText(Config.navigationDefaults.navBarGuestRegistrationText)).toBeVisible();
      });

      it("displays login button", async () => {
        useMockBusiness({});
        renderMobileTaskNav({ isAuthenticated: IsAuthenticated.FALSE });

        expect(screen.queryByText(Config.navigationDefaults.logInButton)).toBeVisible();
      });

      it("displays profile and dashboard buttons", async () => {
        useMockBusiness(generateBusinessNamedBusiness());
        renderMobileTaskNav({ isAuthenticated: IsAuthenticated.FALSE });

        expect(
          within(screen.getByTestId("nav-bar-popup-menu")).queryByText(
            Config.navigationDefaults.navBarGuestText
          )
        ).toBeVisible();
        expect(screen.queryByText(Config.navigationDefaults.profileLinkText)).toBeVisible();
      });

      it("sends user to selfRegistration when registration button is clicked", async () => {
        setLargeScreen(false);
        setupStatefulUserDataContext();
        const user = generateUser({ name: "John Smith", email: "test@example.com" });
        const business = generateGuestBusiness({});
        const userData = generateUserDataForBusiness(business, { user });

        render(
          withAuth(
            <WithStatefulUserData initialUserData={userData}>
              <NavBar landingPage={false} task={undefined} showSidebar={false} />
            </WithStatefulUserData>,
            { isAuthenticated: IsAuthenticated.FALSE }
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
        useMockBusiness({});
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
        useMockBusiness({});
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
        useMockBusiness({});
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
