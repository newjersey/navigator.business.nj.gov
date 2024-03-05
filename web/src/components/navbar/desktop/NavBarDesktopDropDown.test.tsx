import { NavBarDesktopDropDown } from "@/components/navbar/desktop/NavBarDesktopDropDown";
import MenuItem from "@mui/material/MenuItem";
import { fireEvent, render, screen } from "@testing-library/react";

describe("<NavBarDesktopDropDown/>", () => {
  window.open = jest.fn();
  const setOpen = jest.fn();
  const handleClose = jest.fn();

  const menuButtonTitle = "menuButtonTitle";
  const dropDownTitle = "dropDownTitle";
  const subMenuText = "submenutext";

  it("opens when the icon is clicked", () => {
    const mockRef = {
      current: document.createElement("button") as HTMLButtonElement,
    };
    render(
      <NavBarDesktopDropDown
        subMenuElement={[<MenuItem key="submenu">{subMenuText}</MenuItem>]}
        handleClose={handleClose}
        setOpen={setOpen}
        open={false}
        menuButtonTitle={menuButtonTitle}
        dropDownTitle={dropDownTitle}
        anchorRef={mockRef}
        textColor={"base"}
        currentIndex={0}
      />
    );

    expect(screen.getByText(menuButtonTitle)).toBeInTheDocument();
    expect(screen.queryByText(dropDownTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(subMenuText)).not.toBeInTheDocument();

    const openMenuIcon = screen.getByTestId("nav-bar-desktop-dropdown-button");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(setOpen).toHaveBeenCalled();
  });

  it("closes when the close button is clicked", async () => {
    const mockRef = {
      current: document.createElement("button") as HTMLButtonElement,
    };
    render(
      <NavBarDesktopDropDown
        subMenuElement={[<MenuItem key="submenu">{subMenuText}</MenuItem>]}
        handleClose={handleClose}
        setOpen={setOpen}
        open={true}
        menuButtonTitle={menuButtonTitle}
        dropDownTitle={dropDownTitle}
        anchorRef={mockRef}
        textColor={"base"}
        currentIndex={0}
      />
    );

    expect(screen.getByText(menuButtonTitle)).toBeInTheDocument();
    expect(screen.getByText(dropDownTitle)).toBeInTheDocument();
    expect(screen.getByText(subMenuText)).toBeInTheDocument();

    const openMenuIcon = screen.getByTestId("nav-bar-desktop-dropdown-button");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(setOpen).toHaveBeenCalled();
  });
});
