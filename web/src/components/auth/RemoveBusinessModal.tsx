import { useConfig } from "@/lib/data-hooks/useConfig";
import {templateEval, useMountEffectWhenDefined} from "@/lib/utils/helpers";
import React, {ReactElement, useContext, useEffect, useState} from "react";
import {RemoveBusinessContext} from "@/contexts/removeBusinessContext";
import {Checkbox, FormControlLabel, useMediaQuery} from "@mui/material";
import {MediaQueries} from "@/lib/PageSizes";
import {ReverseOrderInMobile} from "@/components/njwds-layout/ReverseOrderInMobile";
import {SecondaryButton} from "@/components/njwds-extended/SecondaryButton";
import {PrimaryButton} from "@/components/njwds-extended/PrimaryButton";
import {ModalZeroButton} from "@/components/ModalZeroButton";
import {LiveChatHelpButton} from "@/components/njwds-extended/LiveChatHelpButton";
import {LargeCallout} from "@/components/njwds-extended/callout/LargeCallout";
import {Content} from "@/components/Content";
import {WithErrorBar} from "@/components/WithErrorBar";
import {Alert} from "@/components/njwds-extended/Alert";


export const RemoveBusinessModal = (): ReactElement => {
  const {
    showRemoveBusinessModal,
    setShowRemoveBusinessModal,
  } = useContext(RemoveBusinessContext);
  const { Config } = useConfig();

  const [checked, setChecked] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setChecked(false);
    setHasError(false);
  }, []);

  useMountEffectWhenDefined(() => {
      setShowRemoveBusinessModal(false);
  },setShowRemoveBusinessModal);

  const isMobileAndUp = useMediaQuery(MediaQueries.mobileAndUp);

  const close = (): void => {
    setChecked(false);
    setHasError(false);
    setShowRemoveBusinessModal(false);
  };

  const removeBusiness = (): void => {
      if(!checked){
        setHasError(true);
        return;
      }

      close();
  };
  const buttonNode = (
    <div
      className={`padding-x-4 padding-y-3 ${
        isMobileAndUp ? "flex flex-column flex-align-end" : ""
      }`}
      data-testid="modal-content"
    >
      <ReverseOrderInMobile>
        <>
          <LiveChatHelpButton />
          <SecondaryButton
            isColor="border-dark-red"
            dataTestId="modal-button-secondary"
            onClick={close}
          >
            {Config.removeBusinessModal.cancelButtonText}
          </SecondaryButton>
          <div className="margin-bottom-2 mobile-lg:margin-bottom-0">
            <PrimaryButton
              isColor="error"
              isRightMarginRemoved={true}
              onClick={removeBusiness}
              dataTestId="modal-button-primary"
            >
              {Config.removeBusinessModal.removeBusinessButtonText}
            </PrimaryButton>
          </div>
        </>
      </ReverseOrderInMobile>
    </div>
  );

  return (
    <ModalZeroButton
      isOpen={showRemoveBusinessModal}
      close={close}
      title={Config.removeBusinessModal.header}
      unpaddedChildren={buttonNode}
    >
      {hasError &&
      <Alert variant="error" dataTestid={"profile-error-alert"} >
        <div>{Config.removeBusinessModal.agreementCheckboxErrorText}</div>
      </Alert>
    }

      <LargeCallout calloutType="warning" >
        <Content>
          {templateEval(Config.removeBusinessModal.filingOfficialBusinessClosureText, { businessName: "Lively Bakery" })}
        </Content>
      </LargeCallout>


      <div className={"padding-5px"}>
        <Content>
          {templateEval(Config.removeBusinessModal.businessRemovalText, { businessName: "Lively Bakery" })}
        </Content>
      </div>

      <div className={"padding-5px"}>
        {Config.removeBusinessModal.irreversibleOperationText}
      </div>

      <div className={"padding-205"}>
        <WithErrorBar hasError={hasError} type={"ALWAYS"}>
        <FormControlLabel
          label={Config.removeBusinessModal.agreementCheckboxText}
          control={
            <Checkbox
              data-testid="agree-checkbox"
              checked={checked}
              onChange={(e) =>{
                setChecked(e.target.checked);
                if(e.target.checked)
                setHasError(false);
            }}
            />
          }
        />
        </WithErrorBar>
      </div>
      <hr />
    </ModalZeroButton>
  );
};
