import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { type GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

const LoginSupportPage = (): ReactElement => {
  const { Config } = useConfig();
  const loginSupport = Config.loginSupportPage;

  return (
    <>
      <NextSeo
        title={loginSupport.pageTitle}
        description="Step-by-step guide to help you log in to Business.NJ.gov using your myNewJersey account."
        noindex={true}
      />
      <PageSkeleton>
        <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
          <SingleColumnContainer>
            <div className="padding-top-5 desktop:padding-top-0">
              <Heading level={1} className="base-darkest text-left">
                {loginSupport.pageTitle}
              </Heading>
              <p className="text-base-dark margin-bottom-4">
                Last updated {loginSupport.lastUpdated}
              </p>

              {loginSupport.steps.map((step, index) => (
                <div key={index} className="margin-bottom-6">
                  <div className="margin-bottom-3">
                    <Content>{step.content}</Content>
                  </div>
                  {step.imagePath && (
                    <div className="margin-bottom-4">
                      <img
                        src={step.imagePath}
                        alt={step.imageAlt || ""}
                        className="width-full maxw-tablet border-1px border-base-lighter"
                      />
                    </div>
                  )}
                </div>
              ))}
              <hr className="bg-base-light" />
              <div
                className="margin-top-6 bg-cool-extra-light"
                role="region"
                aria-label="Support contact"
              >
                <div className="usa-alert__body">
                  <h2 className="usa-alert__heading text-accent-cool-more-dark">
                    {loginSupport.supportCallout.header}
                  </h2>
                  <p className="usa-alert__text margin-bottom-3">
                    {loginSupport.supportCallout.body}
                  </p>
                  <PrimaryButton
                    isIntercomEnabled
                    isColor="primary"
                    onClick={analytics.event.login_support_page_help_button.click.open_live_chat}
                    // dataTestid="support-chat-button"
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

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default LoginSupportPage;
