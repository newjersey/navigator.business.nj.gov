import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { MenuItem, MenuList } from "@mui/material";
import { ReactElement } from "react";

export type MenuConfiguration =
  | "profile"
  | "profile-register-login"
  | "profile-mynj-addbusiness-logout"
  | "login"
  | "login-getstarted";

export interface Props {
  handleClose: () => void;
  open?: boolean;
  hasCloseButton?: boolean;
  menuConfiguration?: MenuConfiguration;
  subMenuElement: ReactElement;
}

export const NavBarPopupMenu = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const { Config } = useConfig();

  const guestOrUserName =
    props.menuConfiguration === "login"
      ? Config.navigationDefaults.myNJAccountText
      : getUserNameOrEmail(userData);

  function handleListKeyDown(event: React.KeyboardEvent): void {
    if (event.key === "Tab") {
      event.preventDefault();
      props.handleClose();
    }
  }

  return (
    <MenuList
      autoFocusItem={props.open}
      variant={"selectedMenu"}
      id="menu-list-grow"
      onKeyDown={handleListKeyDown}
      data-testid={"nav-bar-popup-menu"}
      className="padding-bottom-0"
    >
      <MenuItem
        className={`display-flex ${props.hasCloseButton ? "padding-y-205" : "padding-y-1"} menu-item-title`}
        disabled={true}
      >
        <div className="text-bold">{guestOrUserName}</div>
      </MenuItem>
      <hr className="margin-0 hr-2px" key="name-break" />
      {props.hasCloseButton && (
        <button
          className="right-nav-close fac fdr fjc position-absolute usa-position-bottom-right top-0 right-0 margin-y-2 margin-x-105"
          aria-label="close menu"
          data-testid={"close-button-nav-menu"}
          onClick={(): void => {
            analytics.event.mobile_menu_close_button.click.close_mobile_menu();
            props.handleClose();
          }}
          tabIndex={0}
        >
          <Icon className="font-sans-xl">close</Icon>
        </button>
      )}

      {props.subMenuElement}
    </MenuList>
  );
};
