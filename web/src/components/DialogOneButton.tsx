import { DialogZeroButton } from "@/components/DialogZeroButton";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { Breakpoint } from "@mui/material";
import React, { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  bodyText?: string;
  children?: ReactNode;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
  maxWidth?: Breakpoint;
  dividers?: boolean;
  alertText?: string;
  showAlert?: boolean;
  alertVariant?: AlertVariant;
  isLoading?: boolean;
}

export const DialogOneButton = (props: Props) => {
  const buttonNode = (
    <div
      className="padding-x-4 padding-y-3 bg-base-lightest display-flex flex-column flex-justify-center mobile-lg:flex-row"
      data-testid="modal-content"
    >
      <div className="mobile-lg:margin-left-auto display-flex flex-column-reverse mobile-lg:flex-row">
        <Button style="primary" noRightMargin loading={props.isLoading} onClick={props.primaryButtonOnClick}>
          {props.primaryButtonText}
        </Button>
      </div>
    </div>
  );

  return (
    <DialogZeroButton
      isOpen={props.isOpen}
      close={props.close}
      title={props.title}
      maxWidth={props.maxWidth}
      dividers={props.dividers}
      bodyText={props.bodyText}
      unpaddedChildren={buttonNode}
      showAlert={props.showAlert}
      alertText={props.alertText}
      alertVariant={props.alertVariant}
    >
      {props.children}
    </DialogZeroButton>
  );
};
