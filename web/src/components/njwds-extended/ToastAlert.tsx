import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { Paper, Snackbar, SnackbarProps } from "@mui/material";
import React, { ReactElement, ReactNode } from "react";

interface Props {
  variant: AlertVariant;
  children: ReactNode;
  isOpen: boolean;
  autoHideDuration?: number | null;
  close: () => void;
  snackBarProps?: SnackbarProps;
  heading?: string;
  noIcon?: boolean;
  className?: string;
  dataTestid?: string;
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
