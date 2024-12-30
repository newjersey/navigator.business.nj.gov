import { LegalMessage } from "@/components/LegalMessage";
import { Heading } from "@/components/njwds-extended/Heading";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Hero } from "@/components/njwds/Hero";
import { SupportExploreSignUpChatCards } from "@/components/SupportExploreSignUpChatCards";
import { AuthContext } from "@/contexts/authContext";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { checkQueryValue, QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import analytics from "@/lib/utils/analytics";
import { setABExperienceDimension } from "@/lib/utils/analytics-helpers";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import { ABExperience, decideABExperience } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { NextSeo } from "next-seo";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";

const Home = (): ReactElement => {
  const { business, userData, error } = useUserData();
  const { state } = useContext(AuthContext);
  const { Config } = useConfig();
  const router = useRouter();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const sectionHowItWorks = useRef(null);
  const [fireAnalyticsForSectionHowItWorks, setFireAnalyticsForSectionHowItWorks] = useState(true);
  const sectionHowItWorksInViewport = useIntersectionOnElement(sectionHowItWorks, "-150px");
  const sectionLookingForSupport = useRef(null);
  const [fireAnalyticsForSectionLookingForSupport, setFireAnalyticsForSectionLookingForSupport] =
    useState(true);
  const sectionLookingForSupportInViewport = useIntersectionOnElement(sectionLookingForSupport, "-150px");
  const config = getMergedConfig();

  if (sectionHowItWorksInViewport && fireAnalyticsForSectionHowItWorks) {
    analytics.event.landing_page_how_it_works.scroll.how_it_works_seen();
    setFireAnalyticsForSectionHowItWorks(false);
  }

  if (sectionLookingForSupportInViewport && fireAnalyticsForSectionLookingForSupport) {
    analytics.event.landing_page_more_support.scroll.more_support_seen();
    setFireAnalyticsForSectionLookingForSupport(false);
  }

  let landingPageConfig = Config.landingPage;
  if (typeof window !== "undefined") {
    const abStorage = ABStorageFactory();
    let landingPageExperience: ABExperience;
    const storedExperience = abStorage.getExperience();

    if (storedExperience === undefined) {
      const experience = decideABExperience();
      abStorage.setExperience(experience);
      landingPageExperience = experience;
    } else {
      landingPageExperience = storedExperience;
    }

    setABExperienceDimension(landingPageExperience);
    if (landingPageExperience === "ExperienceB") {
      landingPageConfig = {
        ...landingPageConfig,
        ...Config.landingPageExperienceB,
      };
    }
  }
  useEffect(() => {
    if (state.isAuthenticated === IsAuthenticated.TRUE && router) {
      if (business?.onboardingFormProgress === "COMPLETED") {
        router.replace(ROUTES.dashboard);
      } else if (business?.onboardingFormProgress === "UNSTARTED") {
        router.replace(ROUTES.onboarding);
      } else if (userData === undefined && error !== undefined) {
        router.replace(`${ROUTES.dashboard}?error=true`);
      }
    }
  }, [business, userData, error, router, state.isAuthenticated]);

  useEffect(() => {
    if (!router || !router.isReady || !router.query[QUERIES.signUp]) {
      return;
    }
    if (checkQueryValue(router, QUERIES.signUp, "true")) {
      router.replace(ROUTES.onboarding);
    }
  }, [router]);

  const renderTwoColumnRow = (
    headingText: string,
    supportingText: string,
    imageSrc: string,
    imageAlt: string,
    reverseOrder?: boolean
  ): ReactElement => {
    return (
      <div className={`${isDesktopAndUp ? "landing-two-column-row" : "landing-one-column-row"}`}>
        <div className="grid-row margin-x-05">
          <div
            className={`desktop:grid-col ${isDesktopAndUp ? "" : "text-center"} ${
              reverseOrder && isDesktopAndUp ? "order-last desktop:margin-left-8" : "desktop:margin-right-3"
            }`}
          >
            {isDesktopAndUp ? (
              <>
                <div className="landing-feature-text">
                  <Heading
                    level={2}
                    styleVariant="h1"
                    className="text-base-darkest margin-bottom-4 desktop:margin-bottom-3"
                  >
                    {headingText}
                  </Heading>
                  <div className="text-base-dark">{supportingText}</div>
                </div>
              </>
            ) : (
              <>
                <Heading
                  level={2}
                  styleVariant="h1"
                  className="text-base-darkest margin-right-2 margin-left-2 margin-top-10"
                >
                  {headingText}
                </Heading>
                <img src={imageSrc} alt={imageAlt} />
              </>
            )}
          </div>
          <div
            className={`desktop:grid-col ${
              reverseOrder ? "desktop:margin-right-8" : "desktop:margin-left-3"
            } margin-top-3 desktop:margin-top-0`}
          >
            {isDesktopAndUp ? (
              <img src={imageSrc} alt={imageAlt} className="landing-feature-img" />
            ) : (
              <div className="text-base-dark margin-right-2 margin-left-2 margin-bottom-2">
                {supportingText}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <NextSeo title={getNextSeoTitle(config.pagesMetadata.homeTitle)} />
      <PageSkeleton showNavBar landingPage>
        <main data-testid="main">
          <Hero />
          <section ref={sectionHowItWorks} aria-label={landingPageConfig.section4HeaderText}>
            <div className="minh-mobile margin-top-2 desktop:margin-top-neg-205  padding-bottom-6 text-center bg-base-extra-light">
              <Heading
                level={2}
                styleVariant="h1"
                className="text-accent-cool-darker margin-bottom-6 padding-top-6"
              >
                {landingPageConfig.section4HeaderText}
              </Heading>
              <div
                className={`flex ${
                  isDesktopAndUp ? "flex-row flex-justify-center" : "flex-column flex-align-center"
                } text-accent-cool-darker`}
              >
                <div className="margin-x-3">
                  <img className="" src="/img/Landing-documents.svg" alt="" role="presentation" />
                  <div className="text-accent-cool-darker width-card margin-top-2">
                    {landingPageConfig.section4FirstIconText}
                  </div>
                </div>
                <div
                  className={`how-it-works-section-arrow ${
                    isDesktopAndUp ? "right width-15 height-10" : "down height-5 margin-y-3"
                  }`}
                />
                <div className="margin-x-3">
                  <img className="" src="/img/Landing-checkmarks.svg" alt="" role="presentation" />
                  <div className="text-accent-cool-darker width-card margin-top-2">
                    {landingPageConfig.section4SecondIconText}
                  </div>
                </div>
                <div
                  className={`how-it-works-section-arrow ${
                    isDesktopAndUp ? "left width-15 height-10" : "up height-5 margin-y-3"
                  } `}
                />{" "}
                <div className="margin-x-3">
                  <img className="" src="/img/Landing-building.svg" alt="" role="presentation" />
                  <div className="text-accent-cool-darker width-card margin-top-2">
                    {landingPageConfig.section4ThirdIconText}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Available Tools">
            {renderTwoColumnRow(
              landingPageConfig.section5FirstHeaderText,
              landingPageConfig.section5FirstSupportingText,
              "/img/Landing-step-by-step.svg",
              "Example step-by-step guide from the My Profile application to check business name availability, get your tax registration from the IRS, and more. A progress bar that shows completion of business formation."
            )}
            {renderTwoColumnRow(
              landingPageConfig.section5SecondHeaderText,
              landingPageConfig.section5SecondSupportingText,
              "/img/Landing-funding-and-certifications.svg",
              "Two example opportunity cards from the My Profile application as examples: small business lease grant funding details and veteran-owned business certification details.",
              true
            )}
            {renderTwoColumnRow(
              landingPageConfig.section5ThirdHeaderText,
              landingPageConfig.section5ThirdSupportingText,
              "/img/Landing-and-more.svg",
              "Example of the calendar in the My Profile application with upcoming due dates for annual report and license renewal. Example of progress bar with the heading to check available names and form your business."
            )}
          </section>

          <section
            ref={sectionLookingForSupport}
            aria-label="Looking for more support?"
            className={`${isDesktopAndUp ? "landing-support-container" : ""}`}
          >
            <div className="bg-base-extra-light padding-x-2 desktop:padding-x-0 desktop:padding-bottom-10">
              <div className="desktop:grid-container-widescreen flex flex-column flex-align-center">
                <Heading
                  level={2}
                  className="base-darkest margin-top-7 text-center margin-bottom-5 desktop:margin-top-10 desktop:margin-bottom-8"
                >
                  {landingPageConfig.section6Header}
                </Heading>

                <SupportExploreSignUpChatCards />
                <div className="green-divider-center width-10 desktop:width-mobile margin-top-2 desktop:margin-top-10"></div>
                <div className="desktop:margin-x-15 margin-bottom-8 desktop:margin-bottom-3 text-center desktop:padding-x-15">
                  <div className="desktop:padding-x-16">
                    <LegalMessage />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </PageSkeleton>
    </>
  );
};

export default Home;
