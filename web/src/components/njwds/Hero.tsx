import { LandingPageTiles } from "@/components/LandingPageTiles";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const Hero = (): ReactElement => {
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const router = useRouter();

  let landingPageConfig = Config.landingPage;
  if (ABStorageFactory().getExperience() === "ExperienceB") {
    landingPageConfig = {
      ...Config.landingPage,
      ...Config.landingPageExperienceB,
    };
  }

  const section2CTAOnClick = () => {
    router.push(ROUTES.onboarding);
    analytics.event.landing_page_second_get_started.click.go_to_onboarding();
  };

  const section3CTAOnClick = () => {
    router.push(ROUTES.onboarding);
    analytics.event.landing_page_find_funding.click.go_to_onboarding();
  };

  return (
    <section aria-label="Introduction">
      <div className="hero-gradient-bg margin-top-205 desktop:margin-top-0">
        <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
          <div className="grid-row margin-left-1">
            <div
              className={`desktop:grid-col-7 padding-top-3 padding-bottom-2 desktop:padding-bottom-1 ${
                isDesktopAndUp ? "text-left" : "text-center padding-x-2"
              }`}
            >
              <h1
                className={`text-primary-darker h1-styling-large desktop:margin-top-7 margin-bottom-3 desktop:margin-bottom-2`}
              >
                {landingPageConfig.heroCallOutFirstLineText}
                <br />
              </h1>
              <div className="text-base-darkest font-sans-lg margin-bottom-3 desktop:margin-bottom-3">
                {landingPageConfig.heroSupportingText}
              </div>
            </div>

            <div className="desktop:grid-col-5 order-first desktop:order-last padding-left-10">
              <img className="width-100" src="/img/Hero-img-climb.svg" alt="Hero People Climbing" />
            </div>
          </div>
        </div>
        <LandingPageTiles />
      </div>
      <div className={`${isDesktopAndUp ? "hero-gradient-bg-bottom" : "bg-success-extra-light"}`}>
        <div className="desktop:grid-container-widescreen desktop:padding-x-7 width-100">
          <div className="grid-row">
            <div className="desktop:grid-col-5">
              <div
                className={`${
                  isDesktopAndUp ? "width-80 margin-top-15" : "maxw-tablet margin-auto margin-top-205"
                } padding-x-4 tablet:padding-x-10 desktop:padding-x-0`}
              >
                <img src="/img/Landing-Hero-people.png" alt="People" />
              </div>
            </div>
            <div className="desktop:grid-col-7">
              <div
                className={`padding-x-2 padding-y-3 desktop:padding-0 width-100 margin-top-3 desktop:margin-top-15  padding-bottom-15 desktop:padding-bottom-0 ${
                  isDesktopAndUp ? "text-left" : "text-center"
                }`}
              >
                <div className="border-top-1 border-primary" />
                <h2 className="h1-styling margin-y-4 desktop:margin-y-3">
                  {landingPageConfig.section2HeaderText}
                </h2>
                <div className="font-sans-lg line-height-120 text-base-dark margin-bottom-4 desktop:margin-bottom-3">
                  {landingPageConfig.section2SupportingText}
                </div>
                <PrimaryButton
                  isColor="primary"
                  onClick={section2CTAOnClick}
                  isNotFullWidthOnMobile={true}
                  isRightMarginRemoved={true}
                  isLargeButton={true}
                >
                  {landingPageConfig.section2CallToActionText}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
        {!isDesktopAndUp && (
          <div
            className={`hero-gradient-bg-bottom-mobile ${
              isTabletAndUp ? "margin-top-neg-15 padding-15" : "margin-top-neg-5 padding-8"
            }`}
          />
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
                {landingPageConfig.section3HeaderText}
              </h2>
              <div className="font-sans-lg line-height-120 text-base-dark margin-bottom-4 desktop:margin-bottom-3">
                {landingPageConfig.section3SupportingText}
              </div>
              <PrimaryButton
                isColor="accent-cool-darker"
                onClick={section3CTAOnClick}
                isNotFullWidthOnMobile={true}
                isRightMarginRemoved={true}
                isLargeButton={true}
              >
                {landingPageConfig.section3CallToActionText}
              </PrimaryButton>
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
              <img src="/img/Landing-Hero-people2.png" alt="People" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
