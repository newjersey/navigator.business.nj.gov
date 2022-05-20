import { Content } from "@/components/Content";
import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { Icon } from "@/components/njwds/Icon";
import { Breakpoint, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import React, { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  bodyText?: string;
  children?: ReactNode;
  maxWidth?: Breakpoint;
  dividers?: boolean;
  unpaddedChildren?: ReactNode;
  alertText?: string;
  showAlert?: boolean;
  alertVariant?: AlertVariant;
}

export const DialogZeroButton = (props: Props) => {
  return (
    <Dialog
      fullWidth={false}
      maxWidth={props.maxWidth || "sm"}
      open={props.isOpen}
      onClose={props.close}
      aria-labelledby="modal"
    >
      <DialogTitle id="modal" className="display-flex flex-row flex-align-center">
        <div className="h2-styling padding-x-1 margin-bottom-0">{props.title}</div>
        <IconButton
          aria-label="close"
          className="margin-left-auto"
          onClick={props.close}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ padding: 0 }} dividers={props.dividers}>
        <div className="padding-x-4 padding-bottom-1">
          {props.showAlert && props.alertVariant && props.alertText && (
            <Alert dataTestid="dialog-alert" variant={props.alertVariant} className="margin-top-0">
              <Content>{props.alertText}</Content>
            </Alert>
          )}
          {props.bodyText && (
            <div className="font-body-xs margin-bottom-2 text-base">
              <Content>{props.bodyText}</Content>
            </div>
          )}
          {props.children && <>{props.children}</>}
        </div>
        {props.unpaddedChildren && <>{props.unpaddedChildren}</>}
      </DialogContent>
    </Dialog>
  );
};
