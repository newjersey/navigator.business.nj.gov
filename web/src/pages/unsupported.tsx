import { Content } from "@/components/Content";
import { SupportExploreSignUpChatCards } from "@/components/SupportExploreSignUpChatCards";
import { Heading } from "@/components/njwds-extended/Heading";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { ReturnToPreviousBusinessBar } from "@/components/onboarding/ReturnToPreviousBusinessBar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES } from "@/lib/domain-logic/routes";
import { getBusinessById } from "@businessnjgovnavigator/shared/domain-logic/getBusinessById";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

const UnsupportedPage = (): ReactElement => {
  const { Config } = useConfig();
  const { userData } = useUserData();
  const router = useRouter();

  return (
    <PageSkeleton>
      {router && router.query.additionalBusiness === "true" && userData ? (
        <ReturnToPreviousBusinessBar
          previousBusiness={getBusinessById({
            userData,
            previousBusinessId: router.query[QUERIES.previousBusinessId] as string,
          })}
        />
      ) : (
        <></>
      )}
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
