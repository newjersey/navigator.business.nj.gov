import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/njwds-extended/Button";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement } from "react";

interface Props {
  callToActionText: string;
  onClick: () => void;
}

export const Hero = (props: Props): ReactElement => {
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  return (
    <section aria-label="Introduction">
      <div className="hero-gradient-bg margin-top-205 desktop:margin-top-0">
        <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
          <div className="grid-row">
            <div
              className={`desktop:grid-col-5 padding-top-3 padding-bottom-15 desktop:padding-bottom-10  ${
                isDesktopAndUp ? "text-left" : "text-center padding-x-2"
              }`}
            >
              <h1
                className={`text-primary-darker h1-styling-large desktop:margin-top-7 margin-bottom-3 desktop:margin-bottom-4`}
              >
                {Config.landingPage.heroCalloutFirstLineText}
                <br />
                {Config.landingPage.heroCalloutSecondLineText}
              </h1>
              <div className="text-base-darkest font-sans-lg margin-bottom-3 desktop:margin-bottom-3">
                {Config.landingPage.heroSupportingText}
              </div>
              <div className="desktop:display-inline margin-bottom-2 desktop-margin-bottom-0 desktop:margin-right-2">
                <Button
                  style="primary-big"
                  onClick={props.onClick}
                  dataTestid="hero"
                  widthAutoOnMobile
                  noRightMargin
                >
                  {Config.landingPage.heroCallToActionText}
                </Button>
              </div>

              <AuthButton position="HERO" />
            </div>
            <div className="desktop:grid-col-7 order-first desktop:order-last margin-auto">
              <img className="width-100" src="/img/Hero-img-climb.svg" alt="Hero People Climbing" />
            </div>
          </div>
        </div>
      </div>
      <div className={`${isDesktopAndUp ? "hero-gradient-bg-bottom" : "bg-success-lighter"}`}>
        <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
          <div className="grid-row">
            <div className="desktop:grid-col-5">
              <div
                className={`${
                  isDesktopAndUp ? "width-80 margin-top-15" : "maxw-tablet margin-auto margin-top-205"
                } padding-x-4 tablet:padding-x-10 desktop:padding-x-0`}
              >
                <img src="../img/Landing-hero-people.png" alt="People" />
              </div>
            </div>
            <div className="desktop:grid-col-7">
              <div
                className={`padding-x-2 padding-y-3 desktop:padding-0 width-100 margin-top-3 desktop:margin-top-15  padding-bottom-15 desktop:padding-bottom-0 ${
                  isDesktopAndUp ? "text-left" : "text-center"
                }`}
              >
                <div className="border-top-1 border-primary"></div>
                <h2 className="h1-styling margin-y-4 desktop:margin-y-3">
                  {Config.landingPage.section2HeaderText}
                </h2>
                <div className="font-sans-lg line-height-120 text-base-dark margin-bottom-4 desktop:margin-bottom-3">
                  {Config.landingPage.section2SupportingText}
                </div>
                <Button style="primary-big" onClick={props.onClick} widthAutoOnMobile noRightMargin>
                  {Config.landingPage.section2CallToActionText}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {!isDesktopAndUp && (
          <div
            className={`hero-gradient-bg-bottom-mobile ${
              isTabletAndUp ? "margin-top-neg-15 padding-15" : "margin-top-neg-5 padding-8"
            } `}
          ></div>
        )}
      </div>
      <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100 desktop:margin-bottom-15">
        <div className="grid-row ">
          <div className="desktop:grid-col-7">
            <div
              className={`width-100 margin-top-5 padding-bottom-5 desktop:margin-top-5 desktop:padding-bottom-0 ${
                isDesktopAndUp ? "text-left" : "text-center padding-x-2"
              }`}
            >
              <div className="border-top-1 border-accent-cool-darker"></div>
              <h2 className="h1-styling margin-y-4 desktop:margin-y-3">
                {Config.landingPage.section3HeaderText}
              </h2>
              <div className="font-sans-lg line-height-120 text-base-dark margin-bottom-4 desktop:margin-bottom-3">
                {Config.landingPage.section3SupportingText}
              </div>
              <Button style="accent-cool-darker-big" onClick={props.onClick} widthAutoOnMobile noRightMargin>
                {Config.landingPage.section3CallToActionText}
              </Button>
            </div>
          </div>
          <div className="desktop:grid-col-5 order-first desktop:order-last">
            <div
              className={`${
                isDesktopAndUp
                  ? "width-80 margin-top-5 float-right"
                  : "maxw-tablet margin-auto padding-x-4 tablet:padding-x-10 desktop:padding-x-0 margin-top-neg-15"
              } `}
            >
              <img src="../img/Landing-hero-people2.png" alt="People" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
