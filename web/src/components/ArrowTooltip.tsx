import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import {
  ClickAwayListener,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ReactElement, useState } from "react";

const NavigatorTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
    fontSize: "1em",
    padding: ".5em .75em",
  },
}));

export const ArrowTooltip = (props: TooltipProps): ReactElement => {
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  const [open, setOpen] = useState(false);

  return (
    <>
      {isMobile ? (
        <ClickAwayListener onClickAway={(): void => setOpen(false)}>
          <div className="display-flex">
            <NavigatorTooltip
              arrow
              enterTouchDelay={0}
              onOpen={analytics.event.tooltip.mouseover.view_tooltip}
              slotProps={{
                popper: {
                  disablePortal: true,
                },
              }}
              onClose={(): void => setOpen(false)}
              open={open}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              {...props}
            >
              <div>
                <UnStyledButton onClick={(): void => setOpen(true)}>
                  {props.children}
                </UnStyledButton>
              </div>
            </NavigatorTooltip>
          </div>
        </ClickAwayListener>
      ) : (
        <NavigatorTooltip
          arrow
          enterTouchDelay={0}
          {...props}
          onOpen={analytics.event.tooltip.mouseover.view_tooltip}
        />
      )}
    </>
  );
};
