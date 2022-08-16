import { ModalZeroButton } from "@/components/ModalZeroButton";
import { Button } from "@/components/njwds-extended/Button";
import { Breakpoint } from "@mui/material";
import { ReactNode } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: ReactNode;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
  secondaryButtonText: string;
  maxWidth?: Breakpoint;
  isLoading?: boolean;
}

export const ModalTwoButton = (props: Props) => {
  const buttonNode = (
    <div
      className="padding-x-4 padding-y-3 bg-base-lightest display-flex flex-column flex-justify-center mobile-lg:flex-row"
      data-testid="modal-content"
    >
      <div className="mobile-lg:margin-left-auto display-flex flex-column-reverse mobile-lg:flex-row">
        <Button
          style="secondary"
          dataTestid="modal-button-secondary"
          onClick={props.close}
          className="margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-1"
        >
          {props.secondaryButtonText}
        </Button>
        <Button
          style="primary"
          noRightMargin
          loading={props.isLoading}
          onClick={props.primaryButtonOnClick}
          dataTestid="modal-button-primary"
        >
          {props.primaryButtonText}
        </Button>
      </div>
    </div>
  );

  return (
    <ModalZeroButton
      isOpen={props.isOpen}
      close={props.close}
      title={props.title}
      maxWidth={props.maxWidth}
      unpaddedChildren={buttonNode}
    >
      {props.children}
    </ModalZeroButton>
  );
};
