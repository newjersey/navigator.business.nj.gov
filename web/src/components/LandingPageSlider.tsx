import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { useRouter } from "next/router";
import { ReactElement, useRef, useState } from "react";
import Slider, { CustomArrowProps } from "react-slick";

function NextArrow(props: CustomArrowProps) {
  return (
    <button className="slider-button next" onClick={props.onClick} aria-label="next" aria-hidden="false">
      <Icon className="nextIcon">navigate_next</Icon>
    </button>
  );
}
function PrevArrow(props: CustomArrowProps) {
  return (
    <button className="slider-button prev" onClick={props.onClick} aria-label="previous" aria-hidden="false">
      <Icon className="prevIcon">navigate_before</Icon>
    </button>
  );
}

export const LandingPageSlider = (): ReactElement => {
  const router = useRouter();
  const { Config } = useConfig();
  const [activeTile, setActiveTile] = useState(0);
  const [slideBreakPoint, setSlideBreakPoint] = useState(7);
  const cardRef = useRef<null | HTMLDivElement>(null);
  const sliderRef = useRef<null | HTMLDivElement>(null);

  const getNumberOfTilesToScroll = (): number => {
    const sliderWidth = sliderRef.current?.clientWidth;
    const cardWidth = cardRef.current?.clientWidth;
    const numberOfTiles = 7;

    if (!sliderWidth || !cardWidth) return numberOfTiles;
    const widthAdjustment = 50;
    const numberOfTilesToFit = Math.ceil(sliderWidth / (cardWidth + widthAdjustment));
    const numberOfTilesToScroll = numberOfTiles - numberOfTilesToFit;
    return numberOfTilesToScroll;
  };

  useMountEffect(() => {
    setSlideBreakPoint(getNumberOfTilesToScroll());
    function handleResize() {
      setSlideBreakPoint(getNumberOfTilesToScroll());
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

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

  const settings = {
    className: "slider variable-width",
    slidesToShow: 1,
    slidesToScroll: 2,
    variableWidth: true,
    dots: false,
    arrows: true,
    infinite: false,
    speed: 500,
    nextArrow:
      activeTile < slideBreakPoint ? (
        <NextArrow />
      ) : (
        <>
          <span></span>
        </>
      ),
    beforeChange: (previous: number, next: number) => {
      setActiveTile(next);
    },
    prevArrow:
      activeTile > 0 ? (
        <PrevArrow />
      ) : (
        <>
          <span></span>
        </>
      ),
  };

  return (
    <div className="slider" ref={sliderRef} style={{ marginLeft: "25px", marginRight: "25px" }}>
      <Slider {...settings}>
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/getStarted-icon.svg"}
          tileText={Config.landingPage.landingPageTile1Line1Text}
          tileText2={Config.landingPage.landingPageTile1Line2Text}
          dataTestId={"get-started-tile"}
          reference={cardRef}
          onClick={routeToOnboarding}
          isActive={activeTile === 0}
          isPrimary
        />
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/briefcase-icon.svg"}
          dataTestId={"register-biz-tile"}
          tileText={Config.landingPage.landingPageTile2Text}
          onClick={() => {
            return setFlowAndRouteUser("starting");
          }}
          isActive={activeTile === 1}
        />
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/payTaxes-icon.svg"}
          dataTestId={"pay-taxes-tile"}
          tileText={Config.landingPage.landingPageTile3Text}
          onClick={() => {
            return setFlowAndRouteUser("up-and-running");
          }}
          isActive={activeTile === 2}
        />
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/outOfState-icon.svg"}
          dataTestId={"out-of-state-tile"}
          tileText={Config.landingPage.landingPageTile4Text}
          onClick={() => {
            return setFlowAndRouteUser("out-of-state");
          }}
          isActive={activeTile === 3}
        />
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/eligibleFunding-icon.svg"}
          dataTestId={"eligible-funding-tile"}
          tileText={Config.landingPage.landingPageTile5Text}
          onClick={() => {
            return setFlowAndRouteUser("up-and-running");
          }}
          isActive={activeTile === 4}
        />
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/startBusiness-icon.svg"}
          tileText={Config.landingPage.landingPageTile6Text}
          dataTestId={"start-biz-tile"}
          onClick={() => {
            return setFlowAndRouteUser("starting");
          }}
          isActive={activeTile === 5}
        />
        <LandingPageActionTile
          className={"landing-page-slide"}
          imgPath={"/img/runBusiness-icon.svg"}
          tileText={Config.landingPage.landingPageTile7Text}
          dataTestId={"run-biz-tile"}
          onClick={() => {
            return setFlowAndRouteUser("up-and-running");
          }}
          isActive={activeTile === 6}
        />
      </Slider>
    </div>
  );
};
