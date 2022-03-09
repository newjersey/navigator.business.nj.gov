import { Content } from "@/components/Content";
import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { UnGraduationBox } from "@/components/dashboard/UnGraduationBox";
import { NavBar } from "@/components/navbar/NavBar";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { FilingsCalendar } from "@/components/roadmap/FilingsCalendar";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadDashboardDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, DashboardDisplayContent, Funding, OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  displayContent: DashboardDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
}

const DashboardPage = (props: Props): ReactElement => {
  useAuthProtectedPage();
  const { userData } = useUserData();
  const router = useRouter();
  const [successAlert, setSuccessAlert] = useState<boolean>(false);

  const filteredFundings = userData ? filterFundings(props.fundings, userData) : [];
  const filteredCertifications = userData ? filterCertifications(props.certifications, userData) : [];

  useEffect(() => {
    if (!router.isReady) return;
    const success = router.query.success;
    setSuccessAlert(success === "true");
  }, [router.isReady, router.query.success]);

  return (
    <PageSkeleton showLegalMessage={true} isWidePage={true}>
      <NavBar isWidePage={true} />
      <div className="margin-top-4 desktop:margin-top-0">
        <main id="main" data-testid="SPL-main-ele">
          <div
            data-testid="SPL-div-ele"
            className="usa-section padding-top-0 desktop:padding-top-5 padding-bottom-15"
          >
            <div className="grid-container-widescreen desktop:padding-x-7 width-100">
              <div className="grid-row grid-gap-6">
                <div className="desktop:grid-col-7 usa-prose">
                  <h1>
                    {userData?.user.name
                      ? templateEval(Config.dashboardDefaults.headerText, { name: userData.user.name })
                      : Config.dashboardDefaults.missingNameHeaderText}
                  </h1>
                  <Content>{props.displayContent.introTextMd}</Content>

                  <p>
                    <a
                      href="/profile"
                      onClick={() => analytics.event.roadmap_profile_edit_button.click.return_to_onboarding()}
                    >
                      {Config.dashboardDefaults.editProfileText}
                    </a>
                  </p>

                  <FilingsCalendar
                    taxFilings={
                      userData != null && userData.profileData.dateOfFormation != null
                        ? userData.taxFilingData.filings
                        : []
                    }
                    operateReferences={props.operateReferences}
                  />

                  <p className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</p>

                  {userData?.profileData.initialOnboardingFlow === "STARTING" && <UnGraduationBox />}
                </div>

                <div className="desktop:grid-col-5 usa-prose border-left-2px border-base-lighter margin-top-6 desktop:margin-top-0">
                  <header className="flex flex-justify flex-align-center">
                    <h2>{Config.dashboardDefaults.opportunitiesHeader}</h2>
                    {userData != null && (
                      <div className="text-base-dark font-sans-xs margin-bottom-2">
                        {templateEval(Config.dashboardDefaults.opportunitiesCount, {
                          count: String(filteredCertifications.length + filteredFundings.length),
                        })}
                      </div>
                    )}
                  </header>
                  <hr className="margin-bottom-3 margin-top-0" aria-hidden={true} />
                  <div className="dashboard-opportunities-list">
                    {filteredCertifications.map((cert) => (
                      <OpportunityCard key={cert.id} opportunity={cert} urlPath="certification" />
                    ))}
                    {filteredFundings.map((funding) => (
                      <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />
                    ))}
                  </div>
                  <div className="margin-top-205">
                    <Content>{props.displayContent.opportunityTextMd}</Content>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {successAlert && (
        <ToastAlert
          variant="success"
          isOpen={successAlert}
          close={() => {
            setSuccessAlert(false);
            router.replace({ pathname: "/dashboard" }, undefined, { shallow: true });
          }}
        >
          <div data-testid="toast-alert-SUCCESS" className="h3-styling">
            {Config.profileDefaults.successTextHeader}
          </div>
          <div className="padding-top-05">{Config.profileDefaults.successTextBody}</div>
        </ToastAlert>
      )}
    </PageSkeleton>
  );
};

export const getStaticProps = async (): Promise<GetStaticPropsResult<Props>> => {
  return {
    props: {
      displayContent: loadDashboardDisplayContent(),
      operateReferences: loadOperateReferences(),
      fundings: loadAllFundings(),
      certifications: loadAllCertifications(),
    },
  };
};

export default DashboardPage;
