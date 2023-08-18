import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { LandingPageSlider } from "@/components/LandingPageSlider";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { ActionTile } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  isWelcomePage?: boolean;
}

export const LandingPageTiles = (props: Props): ReactElement => {
  const router = useRouter();
  const istabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { Config } = useConfig();

  let landingPageConfig = Config.landingPage;

  if (props.isWelcomePage) {
    landingPageConfig = {
      ...landingPageConfig,
      ...Config.landingPageExperienceWelcome
    };
  }

  const routeToOnboarding = (): void => {
    router.push(ROUTES.onboarding);
    analytics.event.landing_page_hero_get_started.click.go_to_onboarding();
  };

  const setFlowAndRouteUser = (flow: "starting" | "out-of-state" | "up-and-running"): void => {
    routeWithQuery(router, {
      path: ROUTES.onboarding,
      queries: { [QUERIES.flow]: flow }
    });
  };

  const actionTiles: ActionTile[] = [
    {
      imgPath: "/img/getStarted-icon.svg",
      tileText: landingPageConfig.landingPageGetStartedTileLine1,
      tileText2: landingPageConfig.landingPageGetStartedTileLine2,
      dataTestId: "get-started-tile",
      onClick: routeToOnboarding,
      isPrimary: true
    },
    {
      imgPath: "/img/briefcase-icon.svg",
      tileText: landingPageConfig.landingPageRegisterBizTile,
      dataTestId: "register-biz-tile",
      onClick: (): void => setFlowAndRouteUser("starting")
    },
    {
      imgPath: "/img/payTaxes-icon.svg",
      tileText: landingPageConfig.landingPageTaxesTile,
      dataTestId: "pay-taxes-tile",
      onClick: (): void => setFlowAndRouteUser("up-and-running")
    },
    {
      imgPath: "/img/outOfState-icon.svg",
      dataTestId: "out-of-state-tile",
      tileText: landingPageConfig.landingPageOutOfStateTile,
      onClick: (): void => setFlowAndRouteUser("out-of-state")
    },
    {
      imgPath: "/img/eligibleFunding-icon.svg",
      dataTestId: "eligible-funding-tile",
      tileText: landingPageConfig.landingPageFundingTile,
      onClick: (): void => setFlowAndRouteUser("up-and-running")
    },
    {
      imgPath: "/img/startBusiness-icon.svg",
      dataTestId: "start-biz-tile",
      tileText: landingPageConfig.landingPageStartBizTile,
      onClick: (): void => setFlowAndRouteUser("starting")
    },
    {
      imgPath: "/img/runBusiness-icon.svg",
      dataTestId: "run-biz-tile",
      tileText: landingPageConfig.landingPageTileRunBizTile,
      onClick: (): void => setFlowAndRouteUser("up-and-running")
    }
  ];

  const filterActionTiles = (actionTiles: ActionTile[]): ActionTile[] =>
    actionTiles.filter((actionTile): boolean => {
      if (props.isWelcomePage) {
        const welcomePageTiles = ["get-started-tile", "pay-taxes-tile"];
        return welcomePageTiles.includes(actionTile.dataTestId);
      }
      return true;
    });

  return (
    <>
      {istabletAndUp && !props.isWelcomePage ? (
        <div className="desktop:grid-container-widescreen desktop:width-100">
          <div>
            <LandingPageSlider actionTiles={actionTiles} />
          </div>
        </div>
      ) : (
        <div
          className={`fac desktop:padding-x-7 desktop:grid-container-widescreen ${
            istabletAndUp ? "fdr padding-x-2" : "fdc"
          }`}
        >
          {filterActionTiles(actionTiles).map((actionTile, index) => {
            const actionTileObj = {
              ...actionTile,
              key: `landing-page-tiles-key-${index}`,
              className: "landing-page-tiles"
            };
            return <LandingPageActionTile {...actionTileObj} key={actionTileObj.key} />;
          })}
        </div>
      )}
    </>
  );
};
