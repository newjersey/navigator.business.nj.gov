import { Content } from "@/components/Content";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SupportExploreSignUpChatCards } from "@/components/SupportExploreSignUpChatCards";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

const UnsupportedPage = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <PageSkeleton landingPage={true}>
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <div className={"grid-container width-100 padding-x-105"}>
          <div className="grid-row grid-gap">
            <div className="desktop:grid-col-12 desktop:grid-offset-none tablet:grid-col-5 tablet:grid-offset-4 usa-prose">
              <div className="grid-row padding-top-5">
                <h2 className="base-darkest text-left">{Config.unsupportedNavigatorUserPage.title}</h2>
                <div
                  data-testid="unsupported-subtitle"
                  className="base-darkest margin-bottom-5 desktop:margin-top-5"
                >
                  <Content>{Config.unsupportedNavigatorUserPage.subtitle}</Content>
                </div>
              </div>

              <div className="grid-column flex flex-column flex-align-center">
                <SupportExploreSignUpChatCards />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageSkeleton>
  );
};

export default UnsupportedPage;
