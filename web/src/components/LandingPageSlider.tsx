import { LandingPageActionTile } from "@/components/LandingPageActionTile";
import { Icon } from "@/components/njwds/Icon";
import { ActionTile } from "@/lib/types/types";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useRef, useState } from "react";
import Slider, { CustomArrowProps } from "react-slick";

function NextArrow(props: CustomArrowProps): ReactElement {
  return (
    <button className="slider-button next" onClick={props.onClick} aria-label="next" aria-hidden="false">
      <Icon className="nextIcon">navigate_next</Icon>
    </button>
  );
}
function PrevArrow(props: CustomArrowProps): ReactElement {
  return (
    <button className="slider-button prev" onClick={props.onClick} aria-label="previous" aria-hidden="false">
      <Icon className="prevIcon">navigate_before</Icon>
    </button>
  );
}

interface Props {
  actionTiles: ActionTile[];
}

export const LandingPageSlider = (props: Props): ReactElement => {
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
    function handleResize(): void {
      setSlideBreakPoint(getNumberOfTilesToScroll());
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });

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
    beforeChange: (previous: number, next: number): void => {
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
        {props.actionTiles.map((actionTile, index) => {
          const actionTileObj = {
            ...actionTile,
            key: `landing-page-slider-key-${index}`,
            className: "landing-page-slide",
            isActive: activeTile === index,
            reference: index === 0 ? cardRef : undefined,
          };
          return <LandingPageActionTile {...actionTileObj} key={actionTileObj.key} />;
        })}
      </Slider>
    </div>
  );
};
