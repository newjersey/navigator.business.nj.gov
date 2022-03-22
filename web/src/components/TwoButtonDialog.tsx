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
      <DialogTitle id="modal" className="display-flex flex-row flex-align-center">
        <h2 className="padding-x-1 margin-bottom-0">{props.title}</h2>
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
      <DialogContent sx={{ padding: 0 }}>
        <p className="padding-x-4 padding-bottom-1 font-body-xs">{props.body}</p>
        <div
          className="padding-x-4 padding-y-3 bg-base-lightest display-flex flex-column flex-justify-center mobile-lg:flex-row"
          data-testid="modal-content"
        >
          <div className="mobile-lg:margin-left-auto display-flex flex-column-reverse mobile-lg:flex-row">
            <Button
              style="secondary"
              onClick={props.close}
              className="margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-1"
            >
              {props.secondaryButtonText}
            </Button>
            <Button style="primary" noRightMargin onClick={props.primaryButtonOnClick}>
              {props.primaryButtonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
