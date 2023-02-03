import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
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
        <div className="margin-top-1 mobile-lg:margin-top-0 mobile-lg:margin-right-1">
          <SecondaryButton isColor="primary" dataTestId="modal-button-secondary" onClick={props.close}>
            {props.secondaryButtonText}
          </SecondaryButton>
        </div>
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          isLoading={props.isLoading}
          onClick={props.primaryButtonOnClick}
          dataTestId="modal-button-primary"
        >
          {props.primaryButtonText}
        </PrimaryButton>
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
