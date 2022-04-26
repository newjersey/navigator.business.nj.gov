import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { Paper, Snackbar, SnackbarProps } from "@mui/material";
import React, { ReactElement, ReactNode } from "react";

interface Props {
  readonly variant: AlertVariant;
  readonly children: ReactNode;
  readonly isOpen: boolean;
  readonly autoHideDuration?: number | null;
  readonly close: () => void;
  readonly snackBarProps?: SnackbarProps;
  readonly heading?: string;
  readonly noIcon?: boolean;
  readonly className?: string;
  readonly dataTestid?: string;
}

export const ToastAlert = (props: Props): ReactElement => (
  <Snackbar
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    open={props.isOpen}
    onClose={props.close}
    autoHideDuration={props.autoHideDuration !== null ? 5000 : null}
    disableWindowBlurListener={true}
    ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
    {...props.snackBarProps}
  >
    <div>
      <Paper>
        <Alert
          heading={props.heading}
          className={props.className ?? ""}
          variant={props.variant}
          noIcon={props.noIcon}
          rounded
          dataTestid={props.dataTestid}
        >
          <div className="padding-top-05">{props.children}</div>
        </Alert>
      </Paper>
    </div>
  </Snackbar>
);
