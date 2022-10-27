import { LegalMessage } from "@/components/LegalMessage";
import { NavBar } from "@/components/navbar/NavBar";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SupportExploreSignUpChatCards } from "@/components/SupportExploreSignUpChatCards";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { checkQueryValue, QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import analytics from "@/lib/utils/analytics";
import { setABExperienceDimension } from "@/lib/utils/analytics-helpers";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ABExperience, decideABExperience } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useRef, useState } from "react";

const Home = (): ReactElement => {
  const { userData, error } = useUserData();
  const router = useRouter();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const sectionHowItWorks = useRef(null);
  const [fireAnalyticsForSectionHowItWorks, setFireAnalyticsForSectionHowItWorks] = useState(true);
  const sectionHowItWorksInViewport = useIntersectionOnElement(sectionHowItWorks, "-150px");
  const sectionLookingForSupport = useRef(null);
  const [fireAnalyticsForSectionLookingForSupport, setFireAnalyticsForSectionLookingForSupport] =
    useState(true);
  const sectionLookingForSupportInViewport = useIntersectionOnElement(sectionLookingForSupport, "-150px");

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

    if (storedExperience !== undefined) {
      landingPageExperience = storedExperience;
    } else {
      const experience = decideABExperience();
      abStorage.setExperience(experience);
      landingPageExperience = experience;
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
    if (userData?.formProgress === "COMPLETED") {
      router.replace(ROUTES.dashboard);
    } else if (userData?.formProgress === "UNSTARTED") {
      router.replace(ROUTES.onboarding);
    } else if (userData === undefined && error != undefined) {
      router.replace(`${ROUTES.dashboard}?error=true`);
    }
  }, [userData, error, router]);

  useEffect(() => {
    if (!router.isReady || !router.query[QUERIES.signUp]) return;
    if (checkQueryValue(router, QUERIES.signUp, "true")) {
      router.replace(ROUTES.onboarding);
    }
  }, [router.isReady, router, router.query]);

  const renderTwoColumnRow = (
    headingText: string,
    supportingText: string,
    imageSrc: string,
    imageAlt: string,
    reverseOrder?: boolean
  ) => (
    <div className={`${isDesktopAndUp ? "landing-two-column-row" : "landing-one-column-row"}`}>
      <div className="grid-row">
        <div
          className={`desktop:grid-col ${isDesktopAndUp ? "" : "text-center"} ${
            reverseOrder && isDesktopAndUp ? "order-last desktop:margin-left-8" : "desktop:margin-right-3"
          }`}
        >
          {isDesktopAndUp ? (
            <>
              <div className="landing-feature-text">
                <h2 className="h1-styling text-base-darkest margin-bottom-4 desktop:margin-bottom-3">
                  {headingText}
                </h2>
                <div className="text-base-dark">{supportingText}</div>
              </div>
            </>
          ) : (
            <>
              <h2 className="h1-styling text-base-darkest margin-right-2 margin-left-2 margin-top-10">
                {headingText}
              </h2>
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

  return (
    <PageSkeleton landingPage={true}>
      <NavBar landingPage={true} />
      <main data-testid="main">
        <Hero />
        <section ref={sectionHowItWorks} aria-label="How it works">
          <div className="minh-mobile margin-top-2 desktop:margin-top-neg-205  padding-bottom-6 text-center bg-base-extra-light">
            <h2 className="text-accent-cool-darker h1-styling margin-bottom-6 padding-top-6">
              {landingPageConfig.section4HeaderText}
            </h2>
            <div
              className={`flex ${
                isDesktopAndUp ? "flex-row flex-justify-center" : "flex-column flex-align-center"
              } text-accent-cool-darker`}
            >
              <div className="margin-x-3">
                <img className="" src="/img/Landing-documents.svg" alt="documents" />
                <div className="text-accent-cool-darker width-card margin-top-2">
                  {landingPageConfig.section4FirstIconText}
                </div>
              </div>
              <div
                className={`arrow ${
                  isDesktopAndUp ? "right width-15 height-10" : "down height-5 margin-y-3"
                }`}
              />
              <div className="margin-x-3">
                <img className="" src="/img/Landing-checkmarks.svg" alt="checklist" />
                <div className="text-accent-cool-darker width-card margin-top-2">
                  {landingPageConfig.section4SecondIconText}
                </div>
              </div>
              <div
                className={`arrow ${isDesktopAndUp ? "left width-15 height-10" : "up height-5 margin-y-3"} `}
              />{" "}
              <div className="margin-x-3">
                <img className="" src="/img/Landing-building.svg" alt="government building" />
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
            "step by step guide"
          )}
          {renderTwoColumnRow(
            landingPageConfig.section5SecondHeaderText,
            landingPageConfig.section5SecondSupportingText,
            "/img/Landing-funding-and-certifications.svg",
            "funding and certifications opportunities",
            true
          )}
          {renderTwoColumnRow(
            landingPageConfig.section5ThirdHeaderText,
            landingPageConfig.section5ThirdSupportingText,
            "/img/Landing-and-more.svg",
            "and more tools and features"
          )}
        </section>

        <section
          ref={sectionLookingForSupport}
          aria-label="Looking for more support?"
          className={`${isDesktopAndUp ? "landing-support-container" : ""}`}
        >
          <div className="bg-base-extra-light padding-x-2 desktop:padding-x-0 desktop:padding-bottom-10">
            <div className="desktop:grid-container-widescreen flex flex-column flex-align-center">
              <h2 className="base-darkest margin-top-7 text-center margin-bottom-5 desktop:margin-top-10 desktop:margin-bottom-8">
                {landingPageConfig.section6Header}
              </h2>

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
  );
};

export default Home;
