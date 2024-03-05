import { NavBarDesktopQuickLinks } from "@/components/navbar/desktop/NavBarDesktopQuickLinks";
import { getMergedConfig } from "@/contexts/configContext";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<NavBarDesktopQuickLinks />", () => {
  const Config = getMergedConfig();

  window.open = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("renders the quick links as expected", () => {
    render(<NavBarDesktopQuickLinks />);
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
    expect(screen.getByTestId("navbar-search-icon")).toBeInTheDocument();
  });

  it("renders the plan quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarPlanText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarPlanLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the operate quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarOperateText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarOperateLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the grow quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarGrowText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarGrowLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the updates quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarUpdatesLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the search quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByTestId("navbar-search-icon"));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationDefaults.navigationQuickLinks.navBarSearchLink,
      "_blank",
      "noopener noreferrer"
    );
  });
});
