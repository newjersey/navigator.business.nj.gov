import { Content } from "@/components/Content";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

const PageNotFound = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <PageSkeleton>
      <main className="page-not-found usa-section padding-top-8 desktop:padding-top-15" id="main">
        <SingleColumnContainer>
          <div className="flex flex-column flex-align-center">
            <img src="./img/page-not-found-icon.svg" alt="404 icon" />
            <h1 className="h2-styling margin-top-4 text-accent-cool-darker">
              {Config.pageNotFoundError.errorHeader}
            </h1>
            <div className="text-align-center">
              <Content>{Config.pageNotFoundError.errorDescriptionPt1}</Content>
              <div className="tablet:display-flex">
                <Content>{Config.pageNotFoundError.errorDescriptionPt2}</Content>
                <UnStyledButton className="margin-left-05" style="standard" isUnderline isIntercomEnabled>
                  <Content>{Config.pageNotFoundError.errorChatWithExpert}</Content>
                </UnStyledButton>
              </div>
            </div>
          </div>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export default PageNotFound;
