import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
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
import analytics from "@/lib/utils/analytics";
import { removeBusinessSoftDelete } from "@/lib/domain-logic/removeBusinessSoftDelete";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { useRouter } from "next/compat/router";
import { switchCurrentBusiness } from "@/lib/domain-logic/switchCurrentBusiness";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}

export const RemoveBusinessModal = (props: Props): ReactElement => {
  const userDataFromHook = useUserData();
  const updateQueue = userDataFromHook.updateQueue;
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { state } = useContext(AuthContext);
  const { showRemoveBusinessModal, setShowRemoveBusinessModal } = useContext(RemoveBusinessContext);
  const { Config } = useConfig();
  const router = useRouter();

  const errorRef = useRef<HTMLDivElement>(null);

  const [checked, setChecked] = useState(false);
  const [error, setError] = useState(false);
  const [businessName, setBusinessName] = useState<string>("");

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
    }

    if (showRemoveBusinessModal) {
      setBusinessName(
        getNavBarBusinessTitle(business, state.isAuthenticated === IsAuthenticated.TRUE),
      );
    }
  }, [error, showRemoveBusinessModal, business, state.isAuthenticated]);

  const isMobileAndUp = useMediaQuery(MediaQueries.mobileAndUp);

  const close = (): void => {
    setChecked(false);
    setError(false);
    setShowRemoveBusinessModal(false);
  };

  const removeBusiness = async (): Promise<void> => {
    if (!checked) {
      setError(true);
      return;
    }

    if (props.CMS_ONLY_fakeBusiness) {
      close();
    }

    const userData = userDataFromHook.userData;
    const remainingBusinesses = userData?.businesses
      ? Object.values(userData.businesses)
          .filter(
            (b) =>
              (b.dateDeletedISO === undefined || b.dateDeletedISO === "") && b.id !== business?.id,
          )
          .sort(
            (a, b) => new Date(b.dateCreatedISO).getTime() - new Date(a.dateCreatedISO).getTime(),
          )
      : [];
    const newCurrentBusinessID = remainingBusinesses.length > 0 ? remainingBusinesses[0].id : undefined;

    if (
      business !== undefined &&
      newCurrentBusinessID !== undefined &&
      userData !== undefined &&
      updateQueue !== undefined
    ) {
      const newUserData = removeBusinessSoftDelete({
        userData: userData,
        idToSoftDelete: business.id,
        newCurrentBusinessId: newCurrentBusinessID,
      });

      close();

      await updateQueue?.queue(switchCurrentBusiness(newUserData, newCurrentBusinessID)).update();
      router &&
        (await router.push({
          pathname: ROUTES.dashboard,
          query: {
            [QUERIES.fromDeleteBusiness]: "true",
          },
        }));
    }
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
                data-testid="agreement-checkbox"
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
