import analytics from "@/lib/utils/analytics";
import { Popper, Grow, Paper, ClickAwayListener, MenuItem, MenuList } from "@mui/material";
import { Icon } from "@/components/njwds/Icon";
import { ReactElement } from "react";



interface Props {
  disabled?: boolean;
  anchorRef: React.MutableRefObject<HTMLButtonElement | null>;
  open: boolean;
  textColor: "primary" | "base";
  currentIndex: number;
  menuButtonTitle: string;
  dropDownTitle: string;
  isAuthenticated: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
  icon?: ReactElement;
  subMenuElement: ReactElement;
}

export const NavBarDesktopDropDown = (props: Props): ReactElement => {

  const toggleDropdown = (): void => {
    if (!open) {
      analytics.event.account_name.click.expand_account_menu();
    }
    props.setOpen((prevOpen) => {
      return !prevOpen;
    });
  };



  function handleListKeyDown(event: React.KeyboardEvent): void {
    if (event.key === "Tab") {
      event.preventDefault();
      props.handleClose();
    }
  }

return (
  <>

    <button
      data-testid="profile-dropdown"
      className="border-2px border-solid radius-pill border-base-lighter bg-white-transparent"
      ref={props.anchorRef}
      aria-controls={props.open ? "menu-list-grow" : undefined}
      aria-haspopup="true"
      onClick={toggleDropdown}
      disabled={props.disabled}
    >
      <div className={`text-bold text-${props.textColor} flex flex-align-center`}>
        {props.icon}
        <div className="text-base-darkest truncate-long-business-names_NavBarDesktop">
          {props.menuButtonTitle}
        </div>
        {!props.disabled && <Icon className="usa-icon--size-3">arrow_drop_down</Icon>}
      </div>
    </button>


    <Popper
      open={props.open}
      anchorEl={props.anchorRef.current}
      role={undefined}
      transition
      disablePortal={true}
      placement="bottom-end"
    >
      {({ TransitionProps, placement }): JSX.Element => {
        return (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement.startsWith("bottom") ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={props.handleClose}>
                <div>
                  <MenuList
                    autoFocusItem={props.open}
                    variant={"selectedMenu"}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                    data-testid={"nav-bar-popup-menu"}
                    className="padding-bottom-0"
                  >
                    <MenuItem
                      className={"display-flex padding-y-1 menu-item-title"}
                      disabled={true}
                    >
                      <div className="text-bold">{props.dropDownTitle}</div>
                    </MenuItem>
                    <hr className="margin-0 hr-2px" key="name-break" />
                    {props.subMenuElement}
                  </MenuList>
                </div>
              </ClickAwayListener>
            </Paper>
          </Grow>
        );
      }}
    </Popper>
</>
);

}
