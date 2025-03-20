import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { AuthContext } from "@/contexts/authContext";
import { onSignOut } from "@/lib/auth/signinHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext } from "react";

const PageNotFound = (): ReactElement => {
  const { Config } = useConfig();
  const { unlinkedAccountErrorPage } = Config;
  const { dispatch } = useContext(AuthContext);

  const router = useRouter();
  return (
    <PageSkeleton>
      <main className="page-not-found usa-section padding-top-8 desktop:padding-top-15" id="main">
        <SingleColumnContainer>
          <div className="flex flex-column flex-align-center">
            <h1 className="h2-styling margin-top-4 text-accent-cool-darker">
              {unlinkedAccountErrorPage.unlinkedErrorHeader}
            </h1>
            <div className="text-align-center">
              {unlinkedAccountErrorPage.unlinkedErrorDescription} Please{" "}
              <UnStyledButton
                className="margin-0-override"
                isUnderline
                onClick={() => {
                  if (!router?.isReady) return;
                  onSignOut(router.push, dispatch);
                }}
                isButtonALink
              >
                sign out
              </UnStyledButton>{" "}
              to resolve your issue.
              <div className="tablet:display-flex">
                <UnStyledButton className="margin-left-05" isUnderline isIntercomEnabled>
                  {unlinkedAccountErrorPage.errorChatWithExpert}
                </UnStyledButton>
              </div>
            </div>
          </div>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default PageNotFound;
