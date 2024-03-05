import { NavBarMobileQuickLinksSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileQuickLinksSlideOutMenu";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
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
      mobile_menu_quick_links: {
        click_outside: {
          close_mobile_menu: jest.fn(),
        },
      },
      mobile_hamburger_icon_quick_links: {
        click: {
          open_mobile_menu: jest.fn(),
        },
      },
      mobile_menu_close_button_quick_links: {
        click: {
          close_mobile_menu: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<NavBarMobileQuickLinksSlideOutMenu />", () => {
  const Config = getMergedConfig();

  window.open = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("opens when the icon is clicked", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);

    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarStartText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText)
    ).not.toBeInTheDocument();

    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarStartText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_hamburger_icon_quick_links.click.open_mobile_menu).toHaveBeenCalled();
    });
  });

  it("closes when the close button is clicked", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);

    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarStartText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText)
    ).toBeInTheDocument();

    const closeMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-close");
    expect(closeMenuIcon).toBeInTheDocument();
    fireEvent.click(closeMenuIcon);

    await waitFor(() => {
      expect(
        screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText)
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarStartText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText)
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        mockAnalytics.event.mobile_menu_close_button_quick_links.click.close_mobile_menu
      ).toHaveBeenCalled();
    });
  });

  it("closes when the clicked out of the drawer", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);

    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarStartText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText)
    ).toBeInTheDocument();
    expect(
      screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText)
    ).toBeInTheDocument();

    const closeMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-close-click-outside");
    expect(closeMenuIcon).toBeInTheDocument();
    fireEvent.click(closeMenuIcon);

    await waitFor(() => {
      expect(
        screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText)
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarStartText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText)
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockAnalytics.event.mobile_menu_quick_links.click_outside.close_mobile_menu).toHaveBeenCalled();
    });
  });

  it("renders the plan quick link redirects", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);
    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    fireEvent.click(openMenuIcon);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarPlanLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the operate quick link redirects", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);
    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    fireEvent.click(openMenuIcon);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarOperateLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the grow quick link redirects", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);
    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    fireEvent.click(openMenuIcon);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarGrowLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the updates quick link redirects", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);
    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    fireEvent.click(openMenuIcon);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarUpdatesLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the search quick link redirects", async () => {
    render(<NavBarMobileQuickLinksSlideOutMenu />);
    const openMenuIcon = screen.getByTestId("nav-menu-mobile-quick-link-open");
    fireEvent.click(openMenuIcon);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarSearchText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarSearchLink,
      "_blank",
      "noopener noreferrer"
    );
  });
});
