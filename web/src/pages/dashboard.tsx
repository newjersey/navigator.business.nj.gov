import { OpportunitiesList } from "@/components/dashboard/OpportunitiesList";
import { UnGraduationBox } from "@/components/dashboard/UnGraduationBox";
import { FilingsCalendar } from "@/components/FilingsCalendar";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/navbar/NavBar";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadDashboardDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, DashboardDisplayContent, Funding, OperateReference } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

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

  useEffect(() => {
    if (!router.isReady) return;
    const success = router.query.success;
    setSuccessAlert(success === "true");
  }, [router.isReady, router.query.success]);

  const mainContent = (
    <>
      <Header />
      <FilingsCalendar operateReferences={props.operateReferences} />
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
