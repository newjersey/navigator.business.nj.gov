import { Box, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import type React from "react";
import { type ReactElement, type ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/njwds/Icon";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";

interface DropdownOptionProps {
  className?: string;
}

interface DropdownWrapperProps extends DropdownOptionProps {
  children: ReactNode;
}

type ButtonDropdownOption = {
  text: string;
  props?: DropdownOptionProps;
  onClick: () => void;
};

interface Props {
  children: ReactNode;
  name?: string;
  dropdownOptions: ButtonDropdownOption[];
  wrapper?: (props: DropdownWrapperProps) => ReactElement;
  dropdownClassName?: string;
  horizontal?: boolean;
  hideDivider?: boolean;
}

export const CalendarButtonDropdown = (props: Props): ReactElement => {
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
    event: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>,
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

  const DefaultButton = ({ children, ...props }: DropdownWrapperProps): ReactElement => (
    <UnStyledButton isTextBold isSmallerText {...props}>
      {children}
    </UnStyledButton>
  );

  const Wrapper = props.wrapper ?? DefaultButton;

  const DropdownMenu = (): ReactElement => {
    return (
      <MenuList
        autoFocusItem={open}
        className={`${props.horizontal ? "flex flex-row" : ""}`}
        id="menu-list-grow"
        onKeyDown={handleListKeyDown}
        role={`${props.horizontal ? "menubar" : "menu"}`}
      >
        {props.dropdownOptions.map((option, i) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: dropdown options are a fixed list from the caller and never reorder
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
      {/* biome-ignore lint/a11y/useValidAriaRole: undefined removes MUI Popper's default role="tooltip" from this menu */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        className="z-100"
        role={undefined}
        transition
        disablePortal={true}
        placement={`${props.horizontal ? "bottom" : "bottom-end"}`}
      >
        {({ TransitionProps, placement }): ReactElement => {
          return (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Box className="drop-shadow-xl">
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    {DropdownMenu()}
                  </ClickAwayListener>{" "}
                </Paper>
              </Box>
            </Grow>
          );
        }}
      </Popper>
    </>
  );
};
