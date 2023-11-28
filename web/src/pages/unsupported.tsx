import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SupportExploreSignUpChatCards } from "@/components/SupportExploreSignUpChatCards";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

const UnsupportedPage = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <PageSkeleton>
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <div className="padding-top-5 desktop:padding-top-0">
            <Heading level={2} className="base-darkest text-left">
              {Config.unsupportedNavigatorUserPage.title}
            </Heading>
            <div
              data-testid="unsupported-subtitle"
              className="base-darkest margin-bottom-5 desktop:margin-top-2"
            >
              <Content>{Config.unsupportedNavigatorUserPage.subtitle}</Content>
            </div>
            <div className="flex flex-column flex-align-center">
              <SupportExploreSignUpChatCards />
            </div>
          </div>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export default UnsupportedPage;
