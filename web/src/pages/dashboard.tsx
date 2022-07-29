import { OpportunitiesList } from "@/components/dashboard/OpportunitiesList";
import { UnGraduationBox } from "@/components/dashboard/UnGraduationBox";
import { FilingsCalendar } from "@/components/FilingsCalendar";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RightSidebarPageLayout } from "@/components/RightSidebarPageLayout";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
import { useQueryControlledAlert } from "@/lib/data-hooks/useQueryControlledAlert";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadDashboardDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, DashboardDisplayContent, Funding, OperateReference } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { GetStaticPropsResult } from "next";
import { ReactElement } from "react";

interface Props {
  displayContent: DashboardDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
}

const DashboardPage = (props: Props): ReactElement => {
  useAuthAlertPage();
  const { userData } = useUserData();

  const ProfileUpdatedAlert = useQueryControlledAlert({
    queryKey: "success",
    pagePath: ROUTES.dashboard,
    headerText: Config.profileDefaults.successTextHeader,
    bodyText: Config.profileDefaults.successTextBody,
    variant: "success",
  });

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
        <>{ProfileUpdatedAlert}</>
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
