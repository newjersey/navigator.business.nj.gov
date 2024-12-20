import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { ClickAwayListener, Theme, Tooltip, TooltipProps, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { ReactElement, useState } from "react";

const useStylesBootstrap = makeStyles((theme: Theme) => {
  return {
    arrow: {
      color: theme.palette.common.black,
    },
    tooltip: {
      backgroundColor: theme.palette.common.black,
      fontSize: "1em",
      padding: ".5em .75em",
    },
  };
});

export const ArrowTooltip = (props: TooltipProps): ReactElement<any> => {
  const classes = useStylesBootstrap();

  const isMobile = useMediaQuery(MediaQueries.isMobile);

  const [open, setOpen] = useState(false);

  return (
    <>
      {isMobile ? (
        <ClickAwayListener onClickAway={(): void => setOpen(false)}>
          <div className="display-flex">
            <Tooltip
              arrow
              enterTouchDelay={0}
              classes={classes}
              onOpen={analytics.event.tooltip.mouseover.view_tooltip}
              PopperProps={{
                disablePortal: true,
              }}
              onClose={(): void => setOpen(false)}
              open={open}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              {...props}
            >
              <div>
                <UnStyledButton onClick={(): void => setOpen(true)}>{props.children}</UnStyledButton>
              </div>
            </Tooltip>
          </div>
        </ClickAwayListener>
      ) : (
        <Tooltip
          arrow
          enterTouchDelay={0}
          classes={classes}
          {...props}
          onOpen={analytics.event.tooltip.mouseover.view_tooltip}
        />
      )}
    </>
  );
};
