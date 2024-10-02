import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ReactElement, ReactNode } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: ReactNode;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
  isLoading?: boolean;
  uncloseable?: boolean;
}

export const ModalOneButton = (props: Props): ReactElement => {
  const buttonNode = (
    <div
      className="padding-x-4 padding-y-3 bg-base-lightest flex flex-column flex-align-end"
      data-testid="modal-content"
    >
      <PrimaryButton
        isColor="primary"
        isRightMarginRemoved={true}
        isLoading={props.isLoading}
        onClick={props.primaryButtonOnClick}
      >
        {props.primaryButtonText}
      </PrimaryButton>
    </div>
  );

  return (
    <ModalZeroButton
      isOpen={props.isOpen}
      close={props.close}
      title={props.title}
      unpaddedChildren={buttonNode}
    >
      {props.children}
    </ModalZeroButton>
  );
};
