import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useContext, useRef, useState } from "react";
import { RemoveBusinessContext } from "@/contexts/removeBusinessContext";
import { Checkbox, FormControlLabel, useMediaQuery } from "@mui/material";
import { MediaQueries } from "@/lib/PageSizes";
import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ModalZeroButton } from "@/components/ModalZeroButton";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { Content } from "@/components/Content";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { AuthContext } from "@/contexts/authContext";
import analytics from "@/lib/utils/analytics";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}

export const RemoveBusinessModal = (props: Props): ReactElement => {
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { state } = useContext(AuthContext);
  const { showRemoveBusinessModal, setShowRemoveBusinessModal } = useContext(RemoveBusinessContext);
  const { Config } = useConfig();

  const errorRef = useRef<HTMLDivElement>(null);

  const [checked, setChecked] = useState(false);
  const [hasRemoveBusinessError, setRemoveBusinessError] = useState(false);

  useMountEffectWhenDefined(() => {
    setShowRemoveBusinessModal(false);
  }, setShowRemoveBusinessModal);

  const isMobileAndUp = useMediaQuery(MediaQueries.mobileAndUp);

  const businessName: string = getNavBarBusinessTitle(
    business,
    state.isAuthenticated === IsAuthenticated.TRUE,
  );

  const close = (): void => {
    setChecked(false);
    setRemoveBusinessError(false);
    setShowRemoveBusinessModal(false);
  };

  const removeBusiness = (): void => {
    if (!checked) {
      setRemoveBusinessError(true);
      errorRef.current?.focus();
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
          <LiveChatHelpButton
            analyticsEvent={analytics.event.remove_business_modal_help_button.click.open_live_chat}
          />
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
      {hasRemoveBusinessError && (
        <Alert variant="error" dataTestid={"profile-error-alert"} ref={errorRef}>
          <div>{Config.removeBusinessModal.agreementCheckboxErrorText}</div>
        </Alert>
      )}

      <Content>
        {templateEval(Config.removeBusinessModal.filingOfficialBusinessClosureText, {
          businessName: businessName,
        })}
      </Content>

      <div className={"padding-5px"}>
        <Content>
          {templateEval(Config.removeBusinessModal.businessRemovalText, {
            businessName: businessName,
          })}
        </Content>
      </div>

      <div className={"padding-5px"}>{Config.removeBusinessModal.irreversibleOperationText}</div>

      <div className={"padding-205"}>
        <WithErrorBar hasError={hasRemoveBusinessError} type={"ALWAYS"}>
          <FormControlLabel
            label={Config.removeBusinessModal.agreementCheckboxText}
            control={
              <Checkbox
                data-testid="agree-checkbox"
                checked={checked}
                onChange={(e) => {
                  setChecked(e.target.checked);
                  if (e.target.checked) setRemoveBusinessError(false);
                }}
                className={
                  hasRemoveBusinessError ? "agreement-checkbox-error" : "agreement-checkbox-base"
                }
              />
            }
          />
        </WithErrorBar>
      </div>
      <hr />
    </ModalZeroButton>
  );
};
