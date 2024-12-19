import { GenericButton } from "@/components/njwds-extended/GenericButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { CallToActionHyperlink } from "@/lib/types/types";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import { KeyboardEvent, ReactElement, ReactNode, SyntheticEvent, useEffect, useRef, useState } from "react";

interface Props {
  children: ReactNode;
  dropdownOptions: CallToActionHyperlink[];
  isRightMarginRemoved?: boolean;
}

export const PrimaryButtonDropdown = (props: Props): ReactElement<any> => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event | SyntheticEvent): void => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (<>
    <GenericButton
      className="usa-button"
      ref={anchorRef}
      id="composition-button"
      isAriaControls={open ? "composition-menu" : undefined}
      isAriaExpanded={open ? true : undefined}
      isAriaHaspopup={true}
      onClick={handleToggle}
      isRightMarginRemoved={props.isRightMarginRemoved}
    >
      <>
        {props.children}
        <Icon className="usa-icon--size-3 margin-left-05 margin-right-neg-1" iconName="arrow_drop_down" />
      </>
    </GenericButton>
    <Popper
      open={open}
      anchorEl={anchorRef.current}
      role={undefined}
      placement="bottom-end"
      transition
      disablePortal
    >
      {({ TransitionProps }): ReactElement<any> => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: "left top",
          }}
        >
          <Paper>
            <ClickAwayListener onClickAway={handleClose}>
              <MenuList
                autoFocusItem={open}
                id="composition-menu"
                aria-labelledby="composition-button"
                onKeyDown={handleListKeyDown}
              >
                {props.dropdownOptions.map((option, i) => {
                  return (
                    <MenuItem onClick={option.onClick} key={i}>
                      <UnStyledButton isTextBold isSmallerText>
                        {option.text}
                      </UnStyledButton>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  </>);
};
