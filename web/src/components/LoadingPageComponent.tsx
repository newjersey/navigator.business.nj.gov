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
}

export const LoadingPageComponent = ({ hasError = false }: Props): ReactElement => {
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
        Logout
      </UnStyledButton>
    ),
  };
  return (
    <PageSkeleton showNavBar logoOnly="NAVIGATOR_LOGO">
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <PageCircularIndicator />
          {hasError && (
            <div className="margin-top-4 text-center">
              <Content customComponents={customComponents}>
                {isLoggedIn
                  ? Config.loginSupportPage.timeoutErrorMessageAuthenticated
                  : Config.loginSupportPage.timeoutErrorMessageUnauthenticated}
              </Content>
            </div>
          )}
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};
