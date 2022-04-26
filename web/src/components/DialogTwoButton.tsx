import { DialogZeroButton } from "@/components/DialogZeroButton";
import { Button } from "@/components/njwds-extended/Button";
import { Breakpoint } from "@mui/material";
import React, { ReactNode } from "react";

interface Props {
  readonly isOpen: boolean;
  readonly close: () => void;
  readonly title: string;
  readonly bodyText?: string;
  readonly children?: ReactNode;
  readonly primaryButtonText: string;
  readonly primaryButtonOnClick: () => void;
  readonly secondaryButtonText: string;
  readonly maxWidth?: Breakpoint;
  readonly dividers?: boolean;
}

export const DialogTwoButton = (props: Props) => {
  const buttonNode = (
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
    >
      {props.children}
    </DialogZeroButton>
  );
};
