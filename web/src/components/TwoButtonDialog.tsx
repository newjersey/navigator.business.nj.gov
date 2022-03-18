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
        <div className="padding-top-5 padding-x-1 text-bold font-body-lg">{props.title}</div>
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
      <DialogContent sx={{ padding: 0 }}>
        <p className="padding-x-4 padding-bottom-1 font-body-xs">{props.body}</p>
        <div
          className="padding-x-4 padding-y-3 bg-base-lightest display-flex flex-column flex-justify-center mobile-lg:flex-row"
          data-testid="modal-content"
        >
          <div className="mobile-lg:margin-left-auto">
            <Button
              style="secondary"
              onClick={props.close}
              className="margin-bottom-1 mobile-lg:margin-bottom-0 tablet:margin-right-1"
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
