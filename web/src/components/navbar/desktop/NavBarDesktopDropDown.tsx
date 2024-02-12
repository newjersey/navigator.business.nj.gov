import { ButtonIcon } from "@/components/ButtonIcon";
import { NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import analytics from "@/lib/utils/analytics";
import { Popper, Grow, Paper, ClickAwayListener } from "@mui/material";
import { Icon } from "@/components/njwds/Icon";
import { ReactElement } from "react";



interface Props {
  anchorRef: React.MutableRefObject<HTMLButtonElement | null>;
  open: boolean;
  textColor: "primary" | "base";
  currentIndex: number;
  navBarBusinessTitle: string;
  isAuthenticated: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleClose: () => void;
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

return (
  <>

    <button
      data-testid="profile-dropdown"
      className="border-2px border-solid radius-pill border-base-lighter bg-white-transparent"
      ref={props.anchorRef}
      aria-controls={props.open ? "menu-list-grow" : undefined}
      aria-haspopup="true"
      onClick={toggleDropdown}
    >
      <div className={`text-bold text-${props.textColor} flex flex-align-center margin-left-1`}>
        <ButtonIcon svgFilename={`business-${getBusinessIconColor(props.currentIndex)}`} sizePx="35px" />
        <div className="text-base-darkest truncate-long-business-names_NavBarDesktop">
          {props.navBarBusinessTitle}
        </div>
        <Icon className="usa-icon--size-3">arrow_drop_down</Icon>
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
                  <NavBarPopupMenu
                    handleClose={(): void => props.setOpen(false)}
                    open={props.open}
                    menuConfiguration={
                      props.isAuthenticated ? "profile-mynj-addbusiness-logout" : "profile"
                    }
                    subMenuElement={props.subMenuElement}
                  />
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
