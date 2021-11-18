import { Theme, Tooltip, TooltipProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { ReactElement } from "react";

const useStylesBootstrap = makeStyles((theme: Theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
    fontSize: "1em",
    padding: ".5em .75em",
  },
}));

export const ArrowTooltip = (props: TooltipProps): ReactElement => {
  const classes = useStylesBootstrap();

  return <Tooltip arrow enterTouchDelay={0} classes={classes} {...props} />;
};
