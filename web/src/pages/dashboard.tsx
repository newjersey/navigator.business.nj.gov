import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { FilingsCalendar } from "@/components/roadmap/FilingsCalendar";
import { DashboardDefaults } from "@/display-defaults/dashboard/DashboardDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { loadDashboardDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { loadAllOpportunities } from "@/lib/static/loadOpportunities";
import { DashboardDisplayContent, OperateReference, Opportunity } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";

interface Props {
  displayContent: DashboardDisplayContent;
  operateReferences: Record<string, OperateReference>;
  opportunities: Opportunity[];
}

const DashboardPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { userData } = useUserData();

  return (
    <PageSkeleton showLegalMessage={true}>
      <NavBar />
      <div className="margin-top-6 desktop:margin-top-0">
        <main id="main" data-testid="SPL-main-ele">
          <div
            data-testid="SPL-div-ele"
            className="usa-section padding-top-0 desktop:padding-top-6 padding-bottom-15"
          >
            <div className="grid-container width-100">
              <div className="grid-row grid-gap-6">
                <div className="desktop:grid-col-8 usa-prose">
                  <h1>
                    {userData?.user.name
                      ? templateEval(DashboardDefaults.headerText, { name: userData.user.name })
                      : DashboardDefaults.missingNameHeaderText}
                  </h1>
                  <Content>{props.displayContent.introTextMd}</Content>

                  <p>
                    <a
                      href="/profile"
                      onClick={() => analytics.event.roadmap_profile_edit_button.click.return_to_onboarding()}
                    >
                      {DashboardDefaults.editProfileText}
                    </a>
                  </p>

                  <FilingsCalendar
                    taxFilings={userData?.taxFilingData.filings || []}
                    operateReferences={props.operateReferences}
                  />

                  <p className="text-base-dark">{DashboardDefaults.calendarLegalText}</p>
                </div>

                <div className="desktop:grid-col-4 usa-prose border-left-2px border-base-lighter margin-top-6 desktop:margin-top-0">
                  <h2>{DashboardDefaults.opportunitiesHeader}</h2>
                  <hr className="bg-base-lighter margin-bottom-3" aria-hidden={true} />
                  <div className="dashboard-opportunities-list">
                    {props.opportunities.map((opp) => (
                      <OpportunityCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                  <Content>{props.displayContent.opportunityTextMd}</Content>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      displayContent: loadDashboardDisplayContent(),
      operateReferences: loadOperateReferences(),
      opportunities: loadAllOpportunities(),
    },
  };
};

export default DashboardPage;
