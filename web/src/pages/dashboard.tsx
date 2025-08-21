import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
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

import { useMountEffectWhenDefined } from "@/lib/utils/helpers";

import { Municipality, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import {
  loadAllAnytimeActionLicenseReinstatements,
  loadAllAnytimeActionTasks,
  loadAllCertifications,
  loadAllFundings,
  loadAllLicenseCalendarEvents,
  loadAllMunicipalities,
  loadOperateReferences,
  loadRoadmapSideBarDisplayContent,
  loadXrayRenewalCalendarEvent,
} from "@businessnjgovnavigator/shared/static";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  Funding,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
  XrayRenewalCalendarEventType,
} from "@businessnjgovnavigator/shared/types";
import { useMediaQuery } from "@mui/material";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/compat/router";
import { ReactElement, useState } from "react";

interface Props {
  displayContent: RoadmapDisplayContent;
  operateReferences: Record<string, OperateReference>;
  fundings: Funding[];
  certifications: Certification[];
  municipalities: Municipality[];
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
  licenseEvents: LicenseEventType[];
  xrayRenewalEvent: XrayRenewalCalendarEventType;
}

const DashboardPage = (props: Props): ReactElement => {
  usePageWithNeedsAccountSnackbar();
  const { business, updateQueue } = useUserData();
  const router = useRouter();
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();
  const isLoading = !business || business?.onboardingFormProgress !== "COMPLETED" || !roadmap;
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const [hasElevatorViolations, setHasElevatorViolations] = useState(false);

  useMountEffectWhenDefined(() => {
    (async (): Promise<void> => {
      if (
        business?.profileData.operatingPhase === OperatingPhaseId.GUEST_MODE &&
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
        business?.profileData.operatingPhase === OperatingPhaseId.GUEST_MODE_OWNING &&
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
        router && (await router.replace(ROUTES.onboarding));
      }

      if (isDesktopAndUp && business?.preferences.phaseNewlyChanged) {
        if (!updateQueue || business?.onboardingFormProgress !== "COMPLETED") {
          return;
        }
        await updateQueue.queuePreferences({ phaseNewlyChanged: false }).update();
      }

      if (
        business?.profileData.communityAffairsAddress &&
        business?.profileData.operatingPhase === OperatingPhaseId.UP_AND_RUNNING
      ) {
        const hasViolations = await api.checkElevatorViolations(
          business.profileData.communityAffairsAddress.streetAddress1,
          business.profileData.communityAffairsAddress.municipality.id,
        );
        setHasElevatorViolations(hasViolations);
      }
    })();
  }, [business, updateQueue]);

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <NextSeo title={getNextSeoTitle(Config.pagesMetadata.dashboardTitle)} />
      <PageSkeleton showNavBar>
        <main id="main">
          <DashboardAlerts />
          {isLoading && <PageCircularIndicator />}
          {!isLoading && (
            <Dashboard
              certifications={props.certifications}
              displayContent={props.displayContent}
              fundings={props.fundings}
              operateReferences={props.operateReferences}
              anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
              anytimeActionTasks={props.anytimeActionTasks}
              elevatorViolations={hasElevatorViolations}
              licenseEvents={props.licenseEvents}
              xrayRenewalEvent={props.xrayRenewalEvent}
            />
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
      anytimeActionTasks: loadAllAnytimeActionTasks(),
      anytimeActionLicenseReinstatements: loadAllAnytimeActionLicenseReinstatements(),
      licenseEvents: loadAllLicenseCalendarEvents(),
      xrayRenewalEvent: loadXrayRenewalCalendarEvent(),
    },
  };
};

export default DashboardPage;
