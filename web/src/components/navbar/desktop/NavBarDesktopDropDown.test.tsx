import { NavBarDesktopDropDown } from "@/components/navbar/desktop/NavBarDesktopDropDown";
import analytics from "@/lib/utils/analytics";
import MenuItem from "@mui/material/MenuItem";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      account_name: {
        click: {
          expand_account_menu: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<NavBarDesktopDropDown/>", () => {
  window.open = jest.fn();
  const setOpen = jest.fn();
  const handleClose = jest.fn();

  const menuButtonTitle = "menuButtonTitle";
  const dropDownTitle = "dropDownTitle";
  const subMenuText = "submenutext";

  it("opens when the icon is clicked", async () => {
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
      />
    );

    expect(screen.getByText(menuButtonTitle)).toBeInTheDocument();
    expect(screen.queryByText(dropDownTitle)).not.toBeInTheDocument();
    expect(screen.queryByText(subMenuText)).not.toBeInTheDocument();

    const openMenuIcon = screen.getByTestId("nav-bar-desktop-dropdown-button");
    expect(openMenuIcon).toBeInTheDocument();
    fireEvent.click(openMenuIcon);

    expect(setOpen).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockAnalytics.event.account_name.click.expand_account_menu).toHaveBeenCalled();
    });
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
