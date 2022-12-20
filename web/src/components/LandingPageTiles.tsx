import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { LandingPageSlider } from "@/components/LandingPageSlider";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const LandingPageTiles = (): ReactElement => {
  const router = useRouter();
  const istabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { Config } = useConfig();

  const routeToOnboarding = () => {
    router.push(ROUTES.onboarding);
    analytics.event.landing_page_hero_get_started.click.go_to_onboarding();
  };

  const setFlowAndRouteUser = (flow: "starting" | "out-of-state" | "up-and-running") => {
    routeWithQuery(router, {
      path: ROUTES.onboarding,
      queries: { [QUERIES.flow]: flow },
    });
  };

  return (
    <>
      {istabletAndUp ? (
        <div className="desktop:grid-container-widescreen desktop:width-100">
          <div>
            <LandingPageSlider />
          </div>
        </div>
      ) : (
        <div className={"fdc fjc fac"}>
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/getStarted-icon.svg"}
            tileText={Config.landingPage.landingPageTile1Line1Text}
            tileText2={Config.landingPage.landingPageTile1Line2Text}
            dataTestId={"get-started-tile"}
            onClick={routeToOnboarding}
            isPrimary
          />
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/startBusiness-icon.svg"}
            tileText={Config.landingPage.landingPageTile2Text}
            dataTestId={"start-biz-tile"}
            onClick={() => {
              return setFlowAndRouteUser("starting");
            }}
          />
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/runBusiness-icon.svg"}
            tileText={Config.landingPage.landingPageTile3Text}
            dataTestId={"run-biz-tile"}
            onClick={() => {
              return setFlowAndRouteUser("up-and-running");
            }}
          />
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/outOfState-icon.svg"}
            dataTestId={"out-of-state-tile"}
            tileText={Config.landingPage.landingPageTile4Text}
            onClick={() => {
              return setFlowAndRouteUser("out-of-state");
            }}
          />
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/briefcase-icon.svg"}
            dataTestId={"register-biz-tile"}
            tileText={Config.landingPage.landingPageTile5Text}
            onClick={() => {
              return setFlowAndRouteUser("starting");
            }}
          />
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/payTaxes-icon.svg"}
            dataTestId={"pay-taxes-tile"}
            tileText={Config.landingPage.landingPageTile6Text}
            onClick={() => {
              return setFlowAndRouteUser("up-and-running");
            }}
          />
          <LandingPageActionTile
            className={"landing-page-slide"}
            imgPath={"/img/eligibleFunding-icon.svg"}
            dataTestId={"eligible-funding-tile"}
            tileText={Config.landingPage.landingPageTile7Text}
            onClick={() => {
              return setFlowAndRouteUser("up-and-running");
            }}
          />
        </div>
      )}
    </>
  );
};
