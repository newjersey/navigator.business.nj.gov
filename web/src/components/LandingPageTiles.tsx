import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const LandingPageTiles = (): ReactElement => {
  const router = useRouter();
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const { Config } = useConfig();

  const routeToOnboarding = () => {
    router.push(ROUTES.onboarding);
    analytics.event.landing_page_hero_get_started.click.go_to_onboarding();
  };

  const setFlowToStartingAndRouteToIndustry = () => {
    routeWithQuery(router, {
      path: ROUTES.onboarding,
      queries: {
        [QUERIES.flow]: "starting",
      },
    });
  };

  const setFlowToOutOfStateAndRouteToForeignBusinessTypeIds = () => {
    routeWithQuery(router, {
      path: ROUTES.onboarding,
      queries: {
        [QUERIES.flow]: "out-of-state",
      },
    });
  };

  return (
    <div className={`${isMobile ? "fdc fjc fac" : "fdr"}`}>
      <LandingPageActionTile
        imgPath={"/img/getStarted-icon.svg"}
        tileText={Config.landingPage.landingPageTile1Line1Text}
        tileText2={Config.landingPage.landingPageTile1Line2Text}
        dataTestId={"get-started-tile"}
        onClick={routeToOnboarding}
        isPrimary
      />
      <LandingPageActionTile
        imgPath={"/img/startBusiness-icon.svg"}
        tileText={Config.landingPage.landingPageTile2Text}
        dataTestId={"start-biz-tile"}
        onClick={setFlowToStartingAndRouteToIndustry}
      />
      <LandingPageActionTile
        imgPath={"/img/outOfState-icon.svg"}
        dataTestId={"out-of-state-tile"}
        tileText={Config.landingPage.landingPageTile4Text}
        onClick={setFlowToOutOfStateAndRouteToForeignBusinessTypeIds}
      />
      <LandingPageActionTile
        imgPath={"/img/briefcase-icon.svg"}
        dataTestId={"register-biz-tile"}
        tileText={Config.landingPage.landingPageTile5Text}
        onClick={setFlowToStartingAndRouteToIndustry}
      />
    </div>
  );
};
