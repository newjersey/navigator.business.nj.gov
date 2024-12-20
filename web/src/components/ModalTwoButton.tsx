import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  title: string;
  children: ReactNode;
  primaryButtonText: string;
  primaryButtonOnClick: () => void;
  secondaryButtonText: string;
  secondaryButtonOnClick?: () => void;
  isLoading?: boolean;
}

export const ModalTwoButton = (props: Props): ReactElement<any> => {
  const isMobileAndUp = useMediaQuery(MediaQueries.mobileAndUp);

  const buttonNode = (
    <div
      className={`padding-x-4 padding-y-3 bg-base-lightest ${
        isMobileAndUp ? "flex flex-column flex-align-end" : ""
      }`}
      data-testid="modal-content"
    >
      <ReverseOrderInMobile>
        <>
          <SecondaryButton
            isColor="primary"
            dataTestId="modal-button-secondary"
            onClick={props.secondaryButtonOnClick ?? props.close}
          >
            {props.secondaryButtonText}
          </SecondaryButton>
          <div className="margin-bottom-2 mobile-lg:margin-bottom-0">
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
        </>
      </ReverseOrderInMobile>
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
