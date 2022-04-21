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
        <div className="padding-x-4 padding-y-1">
          {props.bodyText && <p className="font-body-xs">{props.bodyText}</p>}
          {props.children && <>{props.children}</>}
        </div>
        {props.unpaddedChildren && <>{props.unpaddedChildren}</>}
      </DialogContent>
    </Dialog>
  );
};
