import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { Icon } from "@/components/njwds/Icon";
import { IconButton, Paper, Snackbar, SnackbarProps } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  variant: AlertVariant;
  children: ReactNode;
  isOpen: boolean;
  autoHideDuration?: number | null;
  close: () => void;
  closeIcon?: boolean;
  snackBarProps?: SnackbarProps;
  heading?: string;
  noIcon?: boolean;
  className?: string;
  dataTestid?: string;
}

export const SnackbarAlert = (props: Props): ReactElement => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={props.isOpen}
      onClose={props.close}
      autoHideDuration={props.autoHideDuration === null ? null : 5000}
      disableWindowBlurListener={true}
      ClickAwayListenerProps={{ mouseEvent: false, touchEvent: false }}
      role="alert"
      aria-live="polite"
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
            noAlertRole
          >
            <div>{props.children}</div>
          </Alert>
          {props.closeIcon && (
            <IconButton
              aria-label="close"
              data-testid={"close-icon-button"}
              onClick={props.close}
              sx={{
                position: "absolute",
                right: 0,
                top: 15,
                color: "#757575",
              }}
            >
              <Icon className="usa-icon--size-3">close</Icon>
            </IconButton>
          )}
        </Paper>
      </div>
    </Snackbar>
  );
};
