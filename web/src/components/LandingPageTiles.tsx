import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { ActionTile } from "@businessnjgovnavigator/shared/types";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

export type TileConfig = Omit<ActionTile, "onClick"> & {
  flow: "starting" | "out-of-state" | "up-and-running";
  externalUrl?: string;
};

interface LandingPageTilesProps {
  tiles: TileConfig[];
}

export const getStartingBusinessTileSet = (
  landingPageConfig: ConfigType["landingPage"],
): TileConfig[] => [
  {
    imgPath: "/img/startBusiness-icon.svg",
    dataTestId: "start-biz-tile",
    tileText: landingPageConfig.landingPageStartBizTile,
    flow: "starting",
  },
  {
    imgPath: "/img/eligibleFunding-icon.svg",
    dataTestId: "eligible-funding-tile",
    tileText: landingPageConfig.landingPageFundingTile,
    flow: "starting",
    externalUrl: landingPageConfig.landingPageFundingLink,
  },
  {
    imgPath: "/img/gear-icon.svg",
    dataTestId: "business-structure-tile",
    tileText: landingPageConfig.landingPageBusinessStructureTile,
    flow: "starting",
    externalUrl: landingPageConfig.landingPageBusinessStructureLink,
  },
];

export const getExistingBusinessTileSet = (
  landingPageConfig: ConfigType["landingPage"],
): TileConfig[] => [
  {
    imgPath: "/img/payTaxes-icon.svg",
    tileText: landingPageConfig.landingPageAnnualReportTile,
    dataTestId: "annual-report-tile",
    flow: "up-and-running",
    externalUrl: landingPageConfig.landingPageAnnualReportLink,
  },
  {
    imgPath: "/img/rocket-ship-icon.svg",
    dataTestId: "grow-funding-tile",
    tileText: landingPageConfig.landingPageGrowFundingTile,
    flow: "up-and-running",
    externalUrl: landingPageConfig.landingPageGrowFundingLink,
  },
  {
    imgPath: "/img/action-file-icon.svg",
    tileText: landingPageConfig.landingPageSalesTaxTile,
    dataTestId: "sales-tax-tile",
    flow: "up-and-running",
    externalUrl: landingPageConfig.landingPageSalesTaxLink,
  },
];

export const LandingPageTiles = ({ tiles }: LandingPageTilesProps): ReactElement => {
  const router = useRouter();

  const setFlowAndRouteUser = (flow: "starting" | "out-of-state" | "up-and-running"): void => {
    router &&
      routeWithQuery(router, {
        path: ROUTES.onboarding,
        queries: { [QUERIES.flow]: flow },
      });
  };

  const actionTiles: ActionTile[] = tiles.map((tile) => ({
    imgPath: tile.imgPath,
    tileText: tile.tileText,
    dataTestId: tile.dataTestId,
    onClick: (): void => {
      if (tile.externalUrl) {
        window.location.href = tile.externalUrl;
      } else {
        setFlowAndRouteUser(tile.flow);
      }
    },
  }));

  return (
    <div className="display-flex fjc fac padding-top-2 dekstop:padding-bottom-2 padding-bottom-3">
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
