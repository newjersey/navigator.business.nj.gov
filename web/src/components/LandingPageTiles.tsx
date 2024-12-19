import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { ActionTile } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const LandingPageTiles = (): ReactElement<any> => {
  const router = useRouter();
  const { Config } = useConfig();

  const landingPageConfig = Config.landingPage;

  const setFlowAndRouteUser = (flow: "starting" | "out-of-state" | "up-and-running"): void => {
    routeWithQuery(router, {
      path: ROUTES.onboarding,
      queries: { [QUERIES.flow]: flow },
    });
  };

  const actionTiles: ActionTile[] = [
    {
      imgPath: "/img/breif-case-icon.svg",
      tileText: landingPageConfig.landingPageRegisterBizTile,
      dataTestId: "register-biz-tile",
      onClick: (): void => {
        setFlowAndRouteUser("starting");
        analytics.event.landing_page_get_my_registration_guide_tile.click.go_to_onboarding();
      },
    },
    {
      imgPath: "/img/payTaxes-icon.svg",
      tileText: landingPageConfig.landingPageTaxesTile,
      dataTestId: "pay-taxes-tile",
      onClick: (): void => {
        setFlowAndRouteUser("up-and-running");
        analytics.event.landing_page_file_and_pay_my_taxes_tile.click.go_to_onboarding();
      },
    },
    {
      imgPath: "/img/airplane-icon.svg",
      dataTestId: "out-of-state-tile",
      tileText: landingPageConfig.landingPageOutOfStateTile,
      onClick: (): void => {
        setFlowAndRouteUser("out-of-state");
        analytics.event.landing_page_im_an_out_of_business_tile.click.go_to_onboarding();
      },
    },
    {
      imgPath: "/img/eligibleFunding-icon.svg",
      dataTestId: "eligible-funding-tile",
      tileText: landingPageConfig.landingPageFundingTile,
      onClick: (): void => {
        setFlowAndRouteUser("up-and-running");
        analytics.event.landing_page_find_funding_for_my_business_tile.click.go_to_onboarding();
      },
    },
    {
      imgPath: "/img/startBusiness-icon.svg",
      dataTestId: "start-biz-tile",
      tileText: landingPageConfig.landingPageStartBizTile,
      onClick: (): void => {
        setFlowAndRouteUser("starting");
        analytics.event.landing_page_im_starting_a_nj_business_tile.click.go_to_onboarding();
      },
    },
    {
      imgPath: "/img/gear-icon.svg",
      dataTestId: "run-biz-tile",
      tileText: landingPageConfig.landingPageTileRunBizTile,
      onClick: (): void => {
        setFlowAndRouteUser("up-and-running");
        analytics.event.landing_page_im_running_a_nj_business_tile.click.go_to_onboarding();
      },
    },
  ];

  return (
    <div className="display-flex fjc fac padding-top-2 dekstop:padding-bottom-4 padding-bottom-10">
      <div className={"landing-grid-container padding-x-6 desktop:grid-container-widescreen"}>
        {actionTiles.map((actionTile, index) => {
          const actionTileObj = {
            ...actionTile,
            key: `landing-page-tiles-key-${index}`,
          };
          return <LandingPageActionTile {...actionTileObj} key={actionTileObj.key} />;
        })}
      </div>
    </div>
  );
};
