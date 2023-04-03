import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Breakpoint } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: ReactNode;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
  maxWidth?: Breakpoint;
  isLoading?: boolean;
  uncloseable?: boolean;
}

export const ModalOneButton = (props: Props): ReactElement => {
  const buttonNode = (
    <div
      className="padding-x-4 padding-y-3 bg-base-lightest display-flex flex-column flex-justify-center mobile-lg:flex-row"
      data-testid="modal-content"
    >
      <div className="mobile-lg:margin-left-auto display-flex flex-column-reverse mobile-lg:flex-row">
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          isLoading={props.isLoading}
          onClick={props.primaryButtonOnClick}
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
      uncloseable={props.uncloseable}
    >
      {props.children}
    </ModalZeroButton>
  );
};
