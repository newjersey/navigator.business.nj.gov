import { NavBarMobileAccountSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileAccountSlideOutMenu";
import analytics from "@/lib/utils/analytics";
import { MenuItem } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/auth/sessionHelper", () => ({
  triggerSignIn: jest.fn(),
}));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      mobile_hamburger_icon: {
        click: {
          open_mobile_menu: jest.fn(),
        },
      },
      mobile_menu_close_button: {
        click: {
          close_mobile_menu: jest.fn(),
        },
      },
      mobile_menu: {
        click_outside: {
          close_mobile_menu: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<NavBarMobileAccountSlideOutMenu />", () => {
  window.open = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const openSideBar = jest.fn();
  const closeSideBar = jest.fn();

  const innerMenuTitle = "title";
  const subMenuText = "submenutext";

  it("opens when the icon is clicked", async () => {
    render(
      <NavBarMobileAccountSlideOutMenu
        subMenuElement={[<MenuItem key={subMenuText}>{subMenuText}</MenuItem>]}
        closeSideBar={closeSideBar}
        openSideBar={openSideBar}
        isSideBarOpen={false}
        title={innerMenuTitle}
      />
    );

    expect(screen.queryByText(innerMenuTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(subMenuText)).not.toBeInTheDocument();

    const openMenuIcon = screen.getByTestId("nav-menu-mobile-account-open");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(openSideBar).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_icon.click.open_mobile_menu).toHaveBeenCalled();
    });
  });

  it("closes when the close button is clicked", async () => {
    render(
      <NavBarMobileAccountSlideOutMenu
        subMenuElement={[<MenuItem key={subMenuText}>{subMenuText}</MenuItem>]}
        closeSideBar={closeSideBar}
        openSideBar={openSideBar}
        isSideBarOpen={true}
        title={innerMenuTitle}
      />
    );

    expect(screen.getByText(innerMenuTitle)).toBeInTheDocument();
    expect(screen.getByText(subMenuText)).toBeInTheDocument();

    const closeMenuIcon = screen.getByTestId("nav-menu-mobile-account-close");
    expect(closeMenuIcon).toBeInTheDocument();
    fireEvent.click(closeMenuIcon);

    expect(closeSideBar).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_menu_close_button.click.close_mobile_menu).toHaveBeenCalled();
    });
  });

  it("closes when you click outside the drawer", async () => {
    render(
      <NavBarMobileAccountSlideOutMenu
        subMenuElement={[<MenuItem key={subMenuText}>{subMenuText}</MenuItem>]}
        closeSideBar={closeSideBar}
        openSideBar={openSideBar}
        isSideBarOpen={true}
        title={innerMenuTitle}
      />
    );

    expect(screen.getByText(innerMenuTitle)).toBeInTheDocument();
    expect(screen.getByText(subMenuText)).toBeInTheDocument();

    const closeMenuIcon = screen.getByTestId("nav-menu-mobile-account-close-click-outside");
    expect(closeMenuIcon).toBeInTheDocument();
    fireEvent.click(closeMenuIcon);

    expect(closeSideBar).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_menu.click_outside.close_mobile_menu).toHaveBeenCalled();
    });
  });

  it("renders submenu content", () => {
    render(
      <NavBarMobileAccountSlideOutMenu
        subMenuElement={[<MenuItem key={subMenuText}>{subMenuText}</MenuItem>]}
        closeSideBar={closeSideBar}
        openSideBar={openSideBar}
        isSideBarOpen={true}
        title={innerMenuTitle}
      />
    );
    expect(screen.getByText(subMenuText)).toBeInTheDocument();
  });
});
