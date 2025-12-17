import { Content } from "@/components/Content";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { configureAmplify, triggerSignOut } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

interface Props {
  hasError?: boolean;
  isLinkingError?: boolean;
}

export const LoadingPageComponent = ({
  hasError = false,
  isLinkingError = false,
}: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: authState } = useContext(AuthContext);

  const isLoggedIn = authState.isAuthenticated === IsAuthenticated.TRUE;

  const customComponents = {
    logoutButton: (
      <UnStyledButton
        onClick={async () => {
          configureAmplify();
          await triggerSignOut();
        }}
        className="logout-button-unstyled"
      >
        {isLinkingError
          ? Config.loginSupportPage.logoutButtonTextUnlinked
          : Config.loginSupportPage.logoutButtonText}
      </UnStyledButton>
    ),
  };

  const renderErrorState = (): JSX.Element => {
    const titleMessage = isLinkingError
      ? Config.loginSupportPage.unlinkedAccount
      : Config.loginSupportPage.havingTrouble;

    const titleClassName = isLinkingError ? undefined : "text-bold";

    return (
      <div className="margin-top-neg-4 text-center">
        <p className={titleClassName}>{titleMessage}</p>

        {isLoggedIn && (
          <Content customComponents={customComponents}>
            {isLinkingError
              ? Config.loginSupportPage.logoutAndTryAgainUnlinked
              : Config.loginSupportPage.logoutAndTryAgain}
          </Content>
        )}

        <Content className="margin-y-3" showLaunchIcon={false}>
          {Config.loginSupportPage.forMoreAssistance}
        </Content>
      </div>
    );
  };

  return (
    <PageSkeleton showNavBar logoOnly="NAVIGATOR_LOGO">
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <PageCircularIndicator />
          {hasError && renderErrorState()}
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};
