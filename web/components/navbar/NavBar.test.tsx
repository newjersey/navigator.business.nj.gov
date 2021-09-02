import * as materialUi from "@material-ui/core";
import { useMediaQuery } from "@material-ui/core";
import { NavBar } from "@/components/navbar/NavBar";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import { NavDefaults } from "@/display-content/NavDefaults";
import { useUndefinedUserData, useMockUserData } from "@/test/mock/mockUseUserData";
import { generateRoadmap, generateStep, generateTask, generateUser } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { ReactNode } from "react";
import userEvent from "@testing-library/user-event";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@material-ui/core"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@material-ui/core", () => mockMaterialUI());
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

  describe("landing page navbar", () => {
    it("displays landing page navbar when prop is passed", () => {
      const subject = render(<NavBar landingPage={true} />);
      expect(subject.getByText(NavDefaults.registerButton)).toBeInTheDocument();
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
      expect(subject.getAllByText(NavDefaults.myNJAccountText).length).toBeGreaterThan(0);
    });
  };

  describe("desktop - task and roadmap navbar", () => {
    const renderDesktopNav = (): RenderResult => {
      setLargeScreen(true);
      return render(<NavBar landingPage={false} />);
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
      expect(subject.queryByText(NavDefaults.logoutButton)).not.toBeInTheDocument();
      expect(subject.queryByText(NavDefaults.myNJAccountText)).not.toBeInTheDocument();
    });

    it("displays an open dropdown menu when clicked and closes when clicked again", async () => {
      const user = { name: "John Smith", email: "test@example.com" };
      useMockUserData({
        user: generateUser(user),
      });
      const subject = renderDesktopNav();
      const menuEl = subject.getByText(user.name);

      userEvent.click(menuEl);
      expect(subject.getByText(NavDefaults.logoutButton)).toBeInTheDocument();
      expect(subject.getByText(NavDefaults.myNJAccountText)).toBeInTheDocument();

      userEvent.click(menuEl);
      await waitFor(() => {
        expect(subject.queryByText(NavDefaults.logoutButton)).not.toBeInTheDocument();
        expect(subject.queryByText(NavDefaults.myNJAccountText)).not.toBeInTheDocument();
      });
    });
  });

  describe("mobile - roadmap navbar", () => {
    const renderMobileRoadmapNav = (): RenderResult => {
      setLargeScreen(false);
      const subject = render(<NavBar landingPage={false} task={undefined} />);
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
  });

  describe("mobile - task navbar", () => {
    beforeEach(() => {
      useMockRoadmap({});
    });

    const renderMobileTaskNav = (): RenderResult => {
      setLargeScreen(false);
      const subject = render(<NavBar landingPage={false} task={generateTask({})} />);
      fireEvent.click(subject.getByTestId("nav-menu-open"));
      return subject;
    };

    displaysUserNameOrEmail(renderMobileTaskNav);

    it("displays mini-roadmap", () => {
      useMockUserData({});
      useMockRoadmap(generateRoadmap({ steps: [generateStep({ name: "step1" })] }));
      const subject = renderMobileTaskNav();
      expect(subject.queryByText("step1")).toBeInTheDocument();
    });

    it("hide mini-roadmap on-click", () => {
      useMockUserData({});
      useMockRoadmap(
        generateRoadmap({
          steps: [generateStep({ name: "step1", tasks: [generateTask({ name: "task1" })] })],
        })
      );
      const subject = renderMobileTaskNav();
      fireEvent.click(subject.getByText("step1"));
      fireEvent.click(subject.getByText("task1"));
      expect(subject.queryByText("task1")).not.toBeInTheDocument();
    });
  });
});
