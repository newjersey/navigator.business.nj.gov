import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import React, { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

type ButtonDropdownOption = {
  text: string;
  onClick: () => void;
};

interface Props {
  children: ReactNode;
  dropdownOptions: ButtonDropdownOption[];
}

export const ButtonDropdown = (props: Props): ReactElement => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const prevOpen = useRef(open);
  useEffect(() => {
    if (null !== anchorRef.current && prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const toggleDropdown = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (
    event: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>
  ): void => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const DropdownMenu = () => (
    <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
      {props.dropdownOptions.map((option, i) => (
        <MenuItem onClick={option.onClick} key={i}>
          <Button style="tertiary" textBold smallText>
            {option.text}
          </Button>
        </MenuItem>
      ))}
    </MenuList>
  );

  return (
    <>
      <button
        className="usa-button padding-y-05 padding-right-0"
        onClick={toggleDropdown}
        type="button"
        ref={anchorRef}
      >
        <div className="display-flex flex-row height-full">
          <div className="padding-right-2 padding-y-1 display-flex flex-justify-center width-100">
            <div className="flex-align-self-center">{props.children}</div>
          </div>
          <Icon className="usa-icon--size-5 border-left-1px padding-y-1 flex-align-self-center">
            arrow_drop_down
          </Icon>
        </div>
      </button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        className="z-100"
        role={undefined}
        transition
        disablePortal={true}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>{DropdownMenu()}</ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
