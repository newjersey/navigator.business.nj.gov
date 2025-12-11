import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
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
  tertiaryButtonText: string;
  tertiaryButtonOnClick?: () => void;
  isLoading?: boolean;
}

export const ModalThreeButton = (props: Props): ReactElement => {
  const isMobileAndUp = useMediaQuery(MediaQueries.mobileAndUp);

  const buttonRow = (
    <div
      className={`padding-x-4 padding-y-3 ${
        isMobileAndUp
          ? "flex flex-row flex-align-center flex-justify-end"
          : "flex flex-column flex-align-center gap-2"
      }`}
    >
      <ReverseOrderInMobile
        className={`flex flex-column flex-align-stretch ${isMobileAndUp ? "" : "gap-2"}`}
      >
        <UnStyledButton
          onClick={props.tertiaryButtonOnClick ?? props.close}
          dataTestid="modal-button-tertiary"
          className={`${isMobileAndUp ? "padding-right-2" : ""}`}
        >
          <span className="text-bold" style={{ color: "#538200" }}>
            {props.tertiaryButtonText}
          </span>
        </UnStyledButton>
        <SecondaryButton
          isColor="primary"
          dataTestId="modal-button-secondary"
          onClick={props.secondaryButtonOnClick ?? props.close}
        >
          {props.secondaryButtonText}
        </SecondaryButton>
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          isLoading={props.isLoading}
          dataTestId="modal-button-primary"
          onClick={props.primaryButtonOnClick}
        >
          {props.primaryButtonText}
        </PrimaryButton>
      </ReverseOrderInMobile>
    </div>
  );

  return (
    <ModalZeroButton
      isOpen={props.isOpen}
      close={props.close}
      title={props.title}
      hasDividers={false}
      unpaddedChildren={
        <>
          <hr />
          {buttonRow}
        </>
      }
    >
      {props.children}
    </ModalZeroButton>
  );
};
