import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardOnDesktop } from "@/components/dashboard/DashboardOnDesktop";
import { DashboardOnMobile } from "@/components/dashboard/DashboardOnMobile";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { MediaQueries } from "@/lib/PageSizes";
import * as api from "@/lib/api-client/apiClient";
import { usePageWithNeedsAccountSnackbar } from "@/lib/auth/usePageWithNeedsAccountSnackbar";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { ROUTES } from "@/lib/domain-logic/routes";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadRoadmapSideBarDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { loadAllQuickActionLicenseReinstatements } from "@/lib/static/loadQuickActionLicenseReinstatements";
import { loadAllQuickActionLinks } from "@/lib/static/loadQuickActionLinks";
import { loadAllQuickActionTasks } from "@/lib/static/loadQuickActionTasks";
import { loadAllViolations } from "@/lib/static/loadViolations";
import {
  Certification,
  Funding,
  OperateReference,
  QuickActionLicenseReinstatement,
  QuickActionLink,
  QuickActionTask,
  RoadmapDisplayContent,
  ViolationNotice,
} from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ElevatorSafetyViolation, Municipality } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  municipalities: Municipality[];
  quickActionTasks: QuickActionTask[];
  quickActionLinks: QuickActionLink[];
  quickActionLicenseReinstatements: QuickActionLicenseReinstatement[];
  violations: ViolationNotice[];
}

const DashboardPage = (props: Props): ReactElement => {
  usePageWithNeedsAccountSnackbar();
  const { business, updateQueue } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const isLoading = !business || business?.onboardingFormProgress !== "COMPLETED" || !roadmap;
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const [elevatorViolations, setElevatorViolations] = useState<Record<string, ElevatorSafetyViolation[]> | undefined>(undefined);

  useMountEffectWhenDefined(() => {
    (async (): Promise<void> => {
      if (
        business?.profileData.operatingPhase === "GUEST_MODE" &&
        (business?.profileData.businessPersona === "STARTING" ||
          business?.profileData.businessPersona === "FOREIGN") &&
        !business.preferences.visibleSidebarCards.includes("not-registered")
      ) {
        await updateQueue
          ?.queuePreferences({
            visibleSidebarCards: [...business.preferences.visibleSidebarCards, "not-registered"],
          })
          .update();
      }

      if (
        business?.profileData.operatingPhase === "GUEST_MODE_OWNING" &&
        business?.profileData.businessPersona === "OWNING" &&
        !business.preferences.visibleSidebarCards.includes("not-registered-up-and-running")
      ) {
        await updateQueue
          ?.queuePreferences({
            visibleSidebarCards: [
              ...business.preferences.visibleSidebarCards,
              "not-registered-up-and-running",
            ],
          })
          .update();
      }

      if (business?.onboardingFormProgress !== "COMPLETED") {
        await router.replace(ROUTES.onboarding);
      }

      if (isDesktopAndUp && business?.preferences.phaseNewlyChanged) {
        if (!updateQueue || business?.onboardingFormProgress !== "COMPLETED") {
          return;
        }
        await updateQueue.queuePreferences({ phaseNewlyChanged: false }).update();
      }

      if (
        business?.profileData.communityAffairsAddress &&
        business?.profileData.operatingPhase === "UP_AND_RUNNING"
      ) {
        const elevatorViolations = await api.checkElevatorViolations(
          business.profileData.communityAffairsAddress.streetAddress1,
          business.profileData.communityAffairsAddress.municipality.id
        );
        console.log(elevatorViolations)
        setElevatorViolations(elevatorViolations);
      }
    })();
  }, [business, updateQueue]);

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <NextSeo title={getNextSeoTitle(Config.pagesMetadata.dashboardTitle)} />
      <PageSkeleton>
        <NavBar />
        <main id="main">
          <DashboardAlerts />
          {isLoading && <PageCircularIndicator />}
          {!isLoading && (
            <>
              <DashboardOnDesktop
                certifications={props.certifications}
                displayContent={props.displayContent}
                fundings={props.fundings}
                operateReferences={props.operateReferences}
                quickActionLicenseReinstatements={props.quickActionLicenseReinstatements}
                quickActionLinks={props.quickActionLinks}
                quickActionTasks={props.quickActionTasks}
                elevatorViolations={elevatorViolations}
              />
              <DashboardOnMobile
                certifications={props.certifications}
                displayContent={props.displayContent}
                fundings={props.fundings}
                operateReferences={props.operateReferences}
                quickActionLicenseReinstatements={props.quickActionLicenseReinstatements}
                quickActionLinks={props.quickActionLinks}
                quickActionTasks={props.quickActionTasks}
                elevatorViolations={elevatorViolations}
              />
            </>
          )}
        </main>
      </PageSkeleton>
    </MunicipalitiesContext.Provider>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  return {
    props: {
      displayContent: loadRoadmapSideBarDisplayContent(),
      operateReferences: loadOperateReferences(),
      fundings: loadAllFundings(),
      certifications: loadAllCertifications(),
      municipalities: loadAllMunicipalities(),
      quickActionTasks: loadAllQuickActionTasks(),
      quickActionLinks: loadAllQuickActionLinks(),
      quickActionLicenseReinstatements: loadAllQuickActionLicenseReinstatements(),
      violations: loadAllViolations(),
    },
  };
};

export default DashboardPage;
