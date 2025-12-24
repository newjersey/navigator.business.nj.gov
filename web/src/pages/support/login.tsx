import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { configureAmplify, triggerSignOut } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { NextSeo } from "next-seo";
import { ReactElement, useContext } from "react";

const LoginSupportPage = (): ReactElement => {
  const { Config } = useConfig();
  const loginSupport = Config.loginSupportPage;
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
        {loginSupport.logoutButtonText}
      </UnStyledButton>
    ),
  };

  return (
    <>
      <NextSeo
        title={loginSupport.pageTitle}
        description="Step-by-step guide to help you log in to Business.NJ.gov using your myNewJersey account."
        noindex={true}
      />
      <PageSkeleton showNavBar isSeoStarterKit={!isLoggedIn} isLoginPage={isLoggedIn}>
        <main className="usa-section padding-top-1" id="main">
          <div className="grid-container-widescreen desktop:padding-x-7 bg-cool-extra-light padding-y-2">
            <Heading level={1} className="text-secondary-darker text-left">
              {loginSupport.pageTitle}
            </Heading>
            <p className="text-base-dark ">Last updated {loginSupport.lastUpdated}</p>
          </div>
          <SingleColumnContainer>
            <div className="padding-top-1 desktop:padding-top-0 login-support-content">
              <Content>{loginSupport.multipleAccountsCallout}</Content>
              <Content showLaunchIcon={false}>{loginSupport.myNewJerseyIntroContent}</Content>
              <ol className="padding-top-1">
                {loginSupport.steps.map((step, index) => (
                  <li key={index} className="margin-y-05">
                    <Content showLaunchIcon={false}>{step.content}</Content>
                    {step.imagePath && (
                      <div className="margin-top-2 margin-bottom-4">
                        <img
                          src={step.imagePath}
                          alt={step.imageAlt || ""}
                          className="width-full maxw-tablet border-1px border-base-lighter"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {isLoggedIn && (
                <div className="margin-bottom-6">
                  <Content showLaunchIcon={false} customComponents={customComponents}>
                    {loginSupport.logoutIfStillHavingTrouble}
                  </Content>
                </div>
              )}
              <hr className="bg-base-light" />
              <div
                className="margin-top-6 bg-cool-extra-light"
                role="region"
                aria-label="Support contact"
              >
                <div className="usa-alert__body padding-y-2">
                  <h2 className="usa-alert__heading text-secondary-darker">
                    {loginSupport.supportCallout.header}
                  </h2>
                  <p className="usa-alert__text margin-bottom-3">
                    {loginSupport.supportCallout.body}
                  </p>
                  <PrimaryButton
                    isIntercomEnabled
                    isColor="primary"
                    onClick={analytics.event.login_support_page_help_button.click.open_live_chat}
                  >
                    {loginSupport.supportCallout.buttonText}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </SingleColumnContainer>
        </main>
      </PageSkeleton>
    </>
  );
};

export default LoginSupportPage;
