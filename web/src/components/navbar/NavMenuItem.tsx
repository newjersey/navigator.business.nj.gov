import { MenuItem } from "@mui/material";
import { ReactElement } from "react";

interface navMenuItemProps {
  onClick: () => void;
  selected?: boolean;
  icon?: ReactElement;
  className?: string;
  itemText: string;
  justFocused?: boolean;
  key: string;
  dataTestid?: string;
}

export const NavMenuItem = ({
  onClick,
  selected,
  icon,
  className,
  itemText,
  key,
  dataTestid,
}: navMenuItemProps): ReactElement => {
  return (
    <MenuItem
      onClick={onClick}
      className={`font-body-2xs menu-item-focus nav-menu-item-container ${className} ${
        selected ? "bg-primary-extra-light-mui-selected-override text-bold " : ""
      }`}
      selected={selected}
      key={key}
    >
      <div className="icon-width">{icon ?? ""}</div>
      <div className={`text-wrap truncate-long-business-names_NavBarDesktop`} data-testid={dataTestid}>
        {itemText}
      </div>
    </MenuItem>
  );
};
