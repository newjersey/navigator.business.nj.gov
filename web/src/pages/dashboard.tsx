import { Content } from "@/components/Content";
import { OpportunitiesList } from "@/components/dashboard/OpportunitiesList";
import { UnGraduationBox } from "@/components/dashboard/UnGraduationBox";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { FilingsCalendar } from "@/components/roadmap/FilingsCalendar";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
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
import { ReactElement, useEffect, useMemo, useState } from "react";

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

  const editOnClick = () => {
    analytics.event.roadmap_profile_edit_button.click.go_to_profile_screen();
    router.push("/profile");
  };

  useEffect(() => {
    if (!router.isReady) return;
    const success = router.query.success;
    setSuccessAlert(success === "true");
  }, [router.isReady, router.query.success]);

  const taxFilings = useMemo(
    () =>
      userData != null && userData.profileData.dateOfFormation != null ? userData.taxFilingData.filings : [],
    [userData]
  );

  const mainContent = (
    <>
      <h1>
        {userData?.user.name
          ? templateEval(Config.dashboardDefaults.headerText, { name: userData.user.name })
          : Config.dashboardDefaults.missingNameHeaderText}
      </h1>
      <Content>{props.displayContent.introTextMd}</Content>
      <Button
        style="tertiary"
        className="margin-y-2"
        underline={true}
        onClick={editOnClick}
        dataTestid="grey-callout-link"
      >
        {Config.dashboardDefaults.editProfileText}
      </Button>
      {taxFilings.length > 0 ? (
        <>
          <FilingsCalendar taxFilings={taxFilings} operateReferences={props.operateReferences} />

          <p className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</p>
        </>
      ) : (
        <div className=" padding-y-2">
          <h2 className="margin-bottom-0">{Config.dashboardDefaults.calendarHeader}</h2>
          <hr className="bg-base-light margin-y-3 margin-right-105" aria-hidden={true} />
          <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col bg-base-lightest usa-prose padding-y-205 padding-x-3">
            <Content>{Config.dashboardDefaults.emptyCalendarTitleText}</Content>
            <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />

            <Content onClick={editOnClick}>{Config.dashboardDefaults.emptyCalendarBodyText}</Content>
          </div>
        </div>
      )}
      {userData?.profileData.initialOnboardingFlow === "STARTING" && <UnGraduationBox />}
    </>
  );

  const sidebarContent = (
    <>
      <OpportunitiesList
        certifications={props.certifications}
        fundings={props.fundings}
        displayContent={props.displayContent}
      />
    </>
  );
  return (
    <PageSkeleton>
      <NavBar />
      <main id="main">
        <RightSidebarPageLayout color="default" mainContent={mainContent} sidebarContent={sidebarContent} />
        {successAlert && (
          <ToastAlert
            variant="success"
            isOpen={successAlert}
            close={() => {
              setSuccessAlert(false);
              router.replace({ pathname: "/dashboard" }, undefined, { shallow: true });
            }}
            dataTestid="toast-alert-SUCCESS"
            heading={Config.profileDefaults.successTextHeader}
          >
            {Config.profileDefaults.successTextBody}
          </ToastAlert>
        )}
      </main>
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
