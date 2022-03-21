import { Content } from "@/components/Content";
import { OpportunitiesList } from "@/components/dashboard/OpportunitiesList";
import { UnGraduationBox } from "@/components/dashboard/UnGraduationBox";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { FilingsCalendar } from "@/components/roadmap/FilingsCalendar";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadDashboardDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, DashboardDisplayContent, Funding, OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useEffect, useState } from "react";

interface Props {
  displayContent: DashboardDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
}

const DashboardPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { userData } = useUserData();
  const router = useRouter();
  const [successAlert, setSuccessAlert] = useState<boolean>(false);
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);

  const editOnClick = () => {
    if (isAuthenticated == IsAuthenticated.TRUE) {
      analytics.event.roadmap_profile_edit_button.click.return_to_onboarding();
      router.push("/profile");
    } else {
      setModalIsVisible(true);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const success = router.query.success;
    setSuccessAlert(success === "true");
  }, [router.isReady, router.query.success]);
  return (
    <PageSkeleton isWidePage={true}>
      <NavBar isWidePage={true} />
      <hr className="margin-0" />
      <div className={`desktop:margin-top-4 desktop:margin-top-0 ${isDesktopAndUp ? "grayRightGutter" : ""}`}>
        <main id="main" data-testid="SPL-main-ele">
          <div data-testid="SPL-div-ele" className="usa-section padding-0">
            <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
              <div className="grid-row">
                <div className="padding-x-2 desktop:grid-col-7 usa-prose margin-top-6 padding-bottom-7 desktop:padding-bottom-15 desktop:padding-right-5">
                  <h1>
                    {userData?.user.name
                      ? templateEval(Config.dashboardDefaults.headerText, { name: userData.user.name })
                      : Config.dashboardDefaults.missingNameHeaderText}
                  </h1>
                  <Content>{props.displayContent.introTextMd}</Content>

                  <Button
                    style="tertiary"
                    className="margin-y-2 margin-left-05"
                    underline={true}
                    onClick={editOnClick}
                    dataTestid="grey-callout-link"
                  >
                    {Config.dashboardDefaults.editProfileText}
                  </Button>

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
                <div
                  className={`desktop:grid-col-5 usa-prose  border-base-lighter padding-top-6 bg-base-lightest padding-bottom-15 ${
                    !isDesktopAndUp
                      ? "padding-x-2 border-top border-base-light "
                      : "border-left-2px padding-left-5"
                  }`}
                >
                  <OpportunitiesList
                    certifications={props.certifications}
                    fundings={props.fundings}
                    displayContent={props.displayContent}
                  />
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
