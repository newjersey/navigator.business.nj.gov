import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import React from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  body: string;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
  secondaryButtonText: string;
}

export const TwoButtonDialog = (props: Props) => {
  return (
    <Dialog fullWidth={false} maxWidth="sm" open={props.isOpen} onClose={props.close} aria-labelledby="modal">
      <DialogTitle id="modal">
        <div className="padding-top-5 padding-x-2 text-bold font-body-lg">{props.title}</div>
        <IconButton
          aria-label="close"
          onClick={props.close}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <div className="padding-x-2 padding-bottom-3" data-testid="modal-content">
          <p className="padding-bottom-1 font-body-xs">{props.body}</p>
          <Button style="primary" onClick={props.primaryButtonOnClick}>
            {props.primaryButtonText}
          </Button>
          <Button style="secondary" noRightMargin onClick={props.close}>
            {props.secondaryButtonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
