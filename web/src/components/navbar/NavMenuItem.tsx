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
  justFocused,
  onClick,
  selected,
  icon,
  className,
  itemText,
  key,
  dataTestid,
}: navMenuItemProps): ReactElement => {
  const highlitBackgroundClassWithBoldText = "bg-primary-extra-light text-bold ";

  return (
    <MenuItem
      onClick={onClick}
      className={`font-body-2xs menu-item-focus ${className} ${
        selected ? highlitBackgroundClassWithBoldText : "bg-transparent"
      }`}
      selected={selected || justFocused}
      key={key}
    >
      {icon && <div className="icon-width">{icon}</div>}
      <div className={`${icon ? "" : "no-icon-offset"} text-wrap`} data-testid={dataTestid}>
        {itemText}
      </div>
    </MenuItem>
  );
};
