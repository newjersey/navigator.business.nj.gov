import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { Box, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import React, { ReactElement, ReactNode, useEffect, useRef, useState, type JSX } from "react";

type ButtonDropdownOption = {
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
  onClick: () => void;
};

interface Props {
  children: ReactNode;
  name?: string;
  dropdownOptions: ButtonDropdownOption[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapper?: (props: { children: ReactNode; [key: string]: any }) => ReactElement<any>;
  dropdownClassName?: string;
  horizontal?: boolean;
  hideDivider?: boolean;
}

export const CalendarButtonDropdown = (props: Props): ReactElement<any> => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const prevOpen = useRef(open);
  useEffect(() => {
    if (null !== anchorRef.current && prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const toggleDropdown = (): void => {
    setOpen((prevOpen) => {
      return !prevOpen;
    });
  };

  const handleClose = (
    event: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>
  ): void => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent): void {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const DefaultButton = ({
    children,
    ...props
  }: {
    children: ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }): ReactElement<any> => (
    <UnStyledButton isTextBold isSmallerText {...props}>
      {children}
    </UnStyledButton>
  );

  const Wrapper = props.wrapper ?? DefaultButton;

  const DropdownMenu = (): ReactElement<any> => {
    return (
      <MenuList
        autoFocusItem={open}
        className={`${props.horizontal ? "flex flex-row" : ""}`}
        id="menu-list-grow"
        onKeyDown={handleListKeyDown}
        // eslint-disable-next-line jsx-a11y/aria-role
        role={`${props.horizontal ? "menubar" : "menu"}`}
      >
        {props.dropdownOptions.map((option, i) => {
          return (
            <MenuItem onClick={option.onClick} key={i} className={props.dropdownClassName}>
              <Wrapper {...option.props}>{option.text}</Wrapper>
            </MenuItem>
          );
        })}
      </MenuList>
    );
  };

  return (
    <>
      <UnStyledButton
        onClick={toggleDropdown}
        ref={anchorRef}
        dataTestid={`primary${`-${props.name}`}-dropdown-button`}
      >
        <div className="display-flex flex-row height-full">
          <div
            className={`${
              props.hideDivider ? "" : "padding-right-1"
            } padding-y-1 display-flex flex-justify-center width-100`}
          >
            <div className="flex-align-self-center">{props.children}</div>
          </div>
          <Icon
            className={`usa-icon--size-5 ${
              props.hideDivider ? "" : "border-left-1px "
            } padding-y-1 flex-align-self-center`}
            iconName={open ? "arrow_drop_up" : "arrow_drop_down"}
          />
        </div>
      </UnStyledButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        className="z-100"
        role={undefined}
        transition
        disablePortal={true}
        placement={`${props.horizontal ? "bottom" : "bottom-end"}`}
      >
        {({ TransitionProps, placement }): JSX.Element => {
          return (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Box className="drop-shadow-xl">
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>{DropdownMenu()}</ClickAwayListener>{" "}
                </Paper>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
};
