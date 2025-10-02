import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { RemoveBusinessContext } from "@/contexts/removeBusinessContext";
import { Checkbox, useMediaQuery } from "@mui/material";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }
  }, [error]);

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
    setError(false);
    setShowRemoveBusinessModal(false);
  };

  const removeBusiness = (): void => {
    if (!checked) {
      setError(true);
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
      {error && (
        <Alert variant="error" dataTestid={"error-alert"} ref={errorRef}>
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

      <div className={"padding-y-11px"}>
        <WithErrorBar hasError={error} type={"ALWAYS"}>
          <div className={"flex"}>
            <div className={"flex fas"}>
              <Checkbox
                data-testid="agree-checkbox"
                checked={checked}
                onChange={(e) => {
                  setChecked(e.target.checked);
                  if (e.target.checked) setError(false);
                }}
                className={error ? "agreement-checkbox-error" : "agreement-checkbox-base"}
                sx={{
                  alignSelf: {
                    xs: "center",
                    sm: "center",
                  },
                }}
              />
            </div>
            <div>{Config.removeBusinessModal.agreementCheckboxText}</div>
          </div>
        </WithErrorBar>
      </div>
      <hr />
    </ModalZeroButton>
  );
};
