import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardOnDesktop } from "@/components/dashboard/DashboardOnDesktop";
import { DashboardOnMobile } from "@/components/dashboard/DashboardOnMobile";
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
import { loadAllAnytimeActionLicenseReinstatements } from "@/lib/static/loadAnytimeActionLicenseReinstatements";
import { loadAllAnytimeActionLinks } from "@/lib/static/loadAnytimeActionLinks";
import {
  loadAllAnytimeActionAdminTasks,
  loadAllAnytimeActionLicensesTasks,
  loadAllAnytimeActionReinstatementsTasks,
} from "@/lib/static/loadAnytimeActionTasks";
import { loadAllCertifications } from "@/lib/static/loadCertifications";
import { loadRoadmapSideBarDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllFundings } from "@/lib/static/loadFundings";
import { loadAllLicenseCalendarEvents } from "@/lib/static/loadLicenseCalendarEvents";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionLink,
  AnytimeActionTask,
  Certification,
  Funding,
  LicenseEventType,
  OperateReference,
  RoadmapDisplayContent,
} from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { Municipality } from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
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
  anytimeActionLicensesTasks: AnytimeActionTask[];
  anytimeActionAdminTasks: AnytimeActionTask[];
  anytimeActionReinstatementsTasks: AnytimeActionTask[];
  anytimeActionLinks: AnytimeActionLink[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
  licenseEvents: LicenseEventType[];
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
          business.profileData.communityAffairsAddress.municipality.id
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
            <>
              <DashboardOnDesktop
                certifications={props.certifications}
                displayContent={props.displayContent}
                fundings={props.fundings}
                operateReferences={props.operateReferences}
                anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
                anytimeActionLinks={props.anytimeActionLinks}
                anytimeActionAdminTasks={props.anytimeActionAdminTasks}
                anytimeActionLicensesTasks={props.anytimeActionLicensesTasks}
                anytimeActionReinstatementsTasks={props.anytimeActionReinstatementsTasks}
                elevatorViolations={hasElevatorViolations}
                licenseEvents={props.licenseEvents}
              />
              <DashboardOnMobile
                certifications={props.certifications}
                displayContent={props.displayContent}
                fundings={props.fundings}
                operateReferences={props.operateReferences}
                anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
                anytimeActionLinks={props.anytimeActionLinks}
                anytimeActionAdminTasks={props.anytimeActionAdminTasks}
                anytimeActionLicensesTasks={props.anytimeActionLicensesTasks}
                anytimeActionReinstatementsTasks={props.anytimeActionReinstatementsTasks}
                elevatorViolations={hasElevatorViolations}
                licenseEvents={props.licenseEvents}
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
      anytimeActionAdminTasks: loadAllAnytimeActionAdminTasks(),
      anytimeActionLicensesTasks: loadAllAnytimeActionLicensesTasks(),
      anytimeActionReinstatementsTasks: loadAllAnytimeActionReinstatementsTasks(),
      anytimeActionLinks: loadAllAnytimeActionLinks(),
      anytimeActionLicenseReinstatements: loadAllAnytimeActionLicenseReinstatements(),
      licenseEvents: loadAllLicenseCalendarEvents(),
    },
  };
};

export default DashboardPage;
