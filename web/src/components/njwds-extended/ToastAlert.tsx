import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { Paper, Snackbar } from "@mui/material";
import React, { ReactElement, ReactNode } from "react";

interface Props {
  variant: AlertVariant;
  children: ReactNode;
  isOpen: boolean;
  close: () => void;
  heading?: string;
}

export const ToastAlert = (props: Props): ReactElement => (
  <Snackbar
    anchorOrigin={{ vertical: "top", horizontal: "center" }}
    open={props.isOpen}
    onClose={props.close}
    autoHideDuration={3000}
    disableWindowBlurListener={true}
    ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
  >
    <div>
      <Paper>
        <Alert heading={props.heading} variant={props.variant} rounded>
          {props.children}
        </Alert>
      </Paper>
    </div>
  </Snackbar>
);
