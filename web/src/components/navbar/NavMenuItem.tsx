import { MenuItem } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  onClick: () => void;
  selected?: boolean;
  icon?: ReactElement;
  hoverIcon?: ReactElement;
  className?: string;
  itemText: string;
  key: string;
  dataTestid?: string;
  reducedLeftMargin?: boolean;
  padLeft?: boolean;
}

export const NavMenuItem = (props: Props): ReactElement => {
  // React 19: Removed useState for hover to avoid conditional hook issues
  // Use CSS :hover instead if hover styling is needed
  const icon = props.icon ?? "";

  return (
    <MenuItem
      onClick={props.onClick}
      className={`font-body-2xs menu-item-focus nav-menu-item-container ${props.className} ${
        props.selected ? "bg-primary-extra-light-mui-selected-override text-bold " : ""
      }
      ${props.padLeft ? "padLeft " : ""}`}
      selected={props.selected}
      key={props.key}
    >
      <div className={`${props.reducedLeftMargin ? "nav-bar-menu-reduced-width" : "icon-width"}`}>
        {icon}
        {props.hoverIcon && (
          <div className="hover-icon" style={{ display: "none" }}>
            {props.hoverIcon}
          </div>
        )}
      </div>
      <div
        className={`text-wrap truncate-long-business-names_NavBarDesktop`}
        data-testid={props.dataTestid}
      >
        {props.itemText}
      </div>
    </MenuItem>
  );
};
