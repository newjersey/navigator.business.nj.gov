import { NavBarMobileAccountSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileAccountSlideOutMenu";
import { MenuItem } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<NavBarMobileAccountSlideOutMenu />", () => {
  window.open = jest.fn();
  const openSideBar = jest.fn();
  const closeSideBar = jest.fn();

  const innerMenuTitle = "title";
  const subMenuText = "submenutext";

  it("opens when the icon is clicked", () => {
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
