import { Content } from "@/components/Content";
import { AccountSetupForm } from "@/components/data-fields/AccountSetupForm";
import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { AuthContext } from "@/contexts/authContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { usePageWithNeedsAccountSnackbar } from "@/lib/auth/usePageWithNeedsAccountSnackbar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { createProfileFieldErrorMap, OnboardingErrors } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { BusinessUser, createEmptyUser } from "@businessnjgovnavigator/shared/businessUser";
import { useRouter } from "next/router";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";

const AccountSetupPage = (): ReactElement => {
  usePageWithNeedsAccountSnackbar();
  const { Config } = useConfig();
  const { updateQueue, userData } = useUserData();
  const [user, setUser] = useState<BusinessUser>(createEmptyUser());
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const router = useRouter();
  const { setRegistrationStatus } = useContext(NeedsAccountContext);
  const { state } = useContext(AuthContext);
  const queryAnalyticsOccurred = useRef<boolean>(false);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setUser(userData.user);
  }, userData);

  useEffect(() => {
    (async (): Promise<void> => {
      if (state.isAuthenticated === IsAuthenticated.TRUE) {
        await router.replace(ROUTES.dashboard);
      }
    })();
  }, [state.isAuthenticated, router]);

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap<OnboardingErrors>());

  FormFuncWrapper(
    async (): Promise<void> => {
      if (!updateQueue) return;

      updateQueue.queueUser(user);
      let userDataWithUser = updateQueue.current();

      if (user.receiveNewsletter) {
        userDataWithUser = await api.postNewsletter(userDataWithUser);
      }

      if (user.userTesting) {
        userDataWithUser = await api.postUserTesting(userDataWithUser);
      }

      await updateQueue.queue(userDataWithUser).update();
      analytics.event.finish_setup_on_myNewJersey_button.submit.go_to_myNJ_registration();
      onSelfRegister({ router, updateQueue, userData: userDataWithUser, setRegistrationStatus });
    },
    (isValid) => {
      if (isValid) {
        setShowAlert(false);
      } else {
        setShowAlert(true);
      }
    }
  );

  useEffect(() => {
    if (!router.isReady || queryAnalyticsOccurred.current) {
      return;
    }
    if (router.query[QUERIES.source] !== undefined) {
      parseAndSendAnalyticsEvent(router.query[QUERIES.source] as string);
      router.replace({ pathname: ROUTES.accountSetup }, undefined, { shallow: true });
      queryAnalyticsOccurred.current = true;
    }
  }, [router]);

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  const parseAndSendAnalyticsEvent = (source: string): void => {
    const possibleAnalyticsEvents = Object.keys(analytics.event);

    if (
      possibleAnalyticsEvents.includes(source) && // @ts-ignore
      Object.keys(analytics.event[source]).includes("click") && // @ts-ignore
      Object.keys(analytics.event[source].click).includes("go_to_NavigatorAccount_setup")
    ) {
      // @ts-ignore
      analytics.event[source].click.go_to_NavigatorAccount_setup();
    }
  };

  const getContent = (): typeof Config.accountSetup.default => {
    if (state.activeUser?.encounteredMyNjLinkingError) return Config.accountSetup.existingAccount;
    return Config.accountSetup.default;
  };

  return (
    <PageSkeleton showNavBar logoOnly="NAVIGATOR_MYNJ_LOGO">
      <main id="main" className="padding-top-4 desktop:padding-top-8">
        <SingleColumnContainer isSmallerWidth>
          <h1>{getContent().header}</h1>
          {showAlert && <Alert variant="error">{Config.accountSetup.errorAlert}</Alert>}
          <Content>{getContent().body}</Content>
          <ProfileFormContext.Provider value={formContextState}>
            <AccountSetupForm user={user} setUser={setUser} />

            <hr className="margin-top-4 margin-bottom-2" />
            <div className="float-right fdr margin-bottom-8">
              <PrimaryButton
                onClick={onSubmit}
                dataTestId="mynj-submit"
                isColor="primary"
                isSubmitButton={true}
                isRightMarginRemoved={true}
              >
                {getContent().submitButton}
              </PrimaryButton>
            </div>
          </ProfileFormContext.Provider>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export default AccountSetupPage;
