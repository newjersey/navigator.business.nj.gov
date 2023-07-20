import { MenuItem } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  onClick: () => void;
  selected?: boolean;
  icon?: ReactElement;
  hoverIcon?: ReactElement;
  className?: string;
  itemText: string;
  key: string;
  dataTestid?: string;
}

export const NavMenuItem = (props: Props): ReactElement => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const icon = props.hoverIcon && isHovered ? props.hoverIcon : props.icon ?? "";

  return (
    <MenuItem
      onClick={props.onClick}
      onMouseOver={(): void => setIsHovered(true)}
      onMouseOut={(): void => setIsHovered(false)}
      className={`font-body-2xs menu-item-focus nav-menu-item-container ${props.className} ${
        props.selected ? "bg-primary-extra-light-mui-selected-override text-bold " : ""
      }`}
      selected={props.selected}
      key={props.key}
    >
      <div className="icon-width">{icon}</div>
      <div className={`text-wrap truncate-long-business-names_NavBarDesktop`} data-testid={props.dataTestid}>
        {props.itemText}
      </div>
    </MenuItem>
  );
};
