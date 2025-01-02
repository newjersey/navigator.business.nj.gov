import { NavBarDesktopQuickLinks } from "@/components/navbar/desktop/NavBarDesktopQuickLinks";
import { getMergedConfig } from "@/contexts/configContext";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<NavBarDesktopQuickLinks />", () => {
  const Config = getMergedConfig();

  window.open = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the quick links as expected", () => {
    render(<NavBarDesktopQuickLinks />);
    expect(screen.getByText(Config.navigationQuickLinks.navBarPlanText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarStartText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarOperateText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarGrowText)).toBeInTheDocument();
    expect(screen.getByText(Config.navigationQuickLinks.navBarUpdatesText)).toBeInTheDocument();
    expect(screen.getByTestId("navbar-search-icon")).toBeInTheDocument();
  });

  it("renders the plan quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarPlanText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarPlanLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the operate quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarOperateText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarOperateLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the grow quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarGrowText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarGrowLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the updates quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByText(Config.navigationQuickLinks.navBarUpdatesText));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarUpdatesLink,
      "_blank",
      "noopener noreferrer"
    );
  });

  it("renders the search quick link and redirects correctly", async () => {
    render(<NavBarDesktopQuickLinks />);
    fireEvent.click(screen.getByTestId("navbar-search-icon"));

    expect(window.open).toHaveBeenCalledWith(
      Config.navigationQuickLinks.navBarSearchLink,
      "_blank",
      "noopener noreferrer"
    );
  });
});
