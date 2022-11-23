import { useConfig } from "@/lib/data-hooks/useConfig";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";

import { ReactElement } from "react";
import { LandingPageActionTile } from "./LandingPageActionTile";

export const LandingPageTiles = (): ReactElement => {
  const router = useRouter();
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const { Config } = useConfig();

  const setFlowToStartingAndRouteToIndustry = () => {
    routeWithQuery(router, {
      path: ROUTES.onboarding,
      queries: {
        [QUERIES.flow]: "starting",
      },
    });
  };

  return (
    <div className={`${isMobile ? "fdc fjc fac" : "fdr"}`}>
      <LandingPageActionTile
        imgPath={"/img/getStarted-icon.svg"}
        tileText={Config.landingPage.LandingPageTile1Text}
        dataTestId={"get-started-tile"}
        onClick={setFlowToStartingAndRouteToIndustry}
        isPrimary
      />
      <LandingPageActionTile
        imgPath={"/img/startBusiness-icon.svg"}
        tileText={Config.landingPage.LandingPageTile2Text}
        dataTestId={"start-biz-tile"}
        onClick={setFlowToStartingAndRouteToIndustry}
      />
      <LandingPageActionTile
        imgPath={"/img/briefcase-icon.svg"}
        dataTestId={"register-biz-tile"}
        tileText={Config.landingPage.LandingPageTile5Text}
        onClick={setFlowToStartingAndRouteToIndustry}
      />
    </div>
  );
};
