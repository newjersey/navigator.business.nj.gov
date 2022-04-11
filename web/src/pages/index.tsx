import { LegalMessage } from "@/components/LegalMessage";
import { NavBar } from "@/components/navbar/NavBar";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import analytics from "@/lib/utils/analytics";
import { setABExperienceDimension } from "@/lib/utils/analytics-helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ABExperience, decideABExperience } from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";

const Home = (): ReactElement => {
  const { userData, error } = useUserData();
  const router = useRouter();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

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
      if (userData?.profileData.hasExistingBusiness) {
        router.replace("/dashboard");
      } else {
        router.replace("/roadmap");
      }
    } else if (userData?.formProgress === "UNSTARTED") {
      router.replace("/onboarding");
    } else if (userData === undefined && error != undefined) {
      router.replace("/roadmap?error=true");
    }
  }, [userData, error, router]);

  useEffect(() => {
    if (!router.isReady || !router.query.signUp) return;
    if (router.query.signUp === "true") {
      router.replace("/onboarding");
    }
  }, [router.isReady, router, router.query]);

  const renderTwoColumnRow = (
    headingText: string,
    supportingText: string,
    imageSrc: string,
    imageAlt: string,
    reverseOrder?: boolean
  ) => (
    <div className="grid-row margin-top-5 desktop:margin-top-10 ">
      <div
        className={`desktop:grid-col ${isDesktopAndUp ? "" : "text-center"} ${
          reverseOrder && isDesktopAndUp ? "order-last desktop:margin-left-8" : "desktop:margin-right-8"
        }`}
      >
        {isDesktopAndUp ? (
          <>
            <h2 className="h1-styling text-base-darkest margin-bottom-4 desktop:margin-bottom-3">
              {headingText}
            </h2>
            <div className="text-base-dark">{supportingText}</div>
          </>
        ) : (
          <>
            <h2 className="h1-styling text-base-darkest margin-bottom-4 desktop:margin-bottom-3">
              {headingText}
            </h2>
            <img src={imageSrc} alt={imageAlt} />
          </>
        )}
      </div>
      <div
        className={`desktop:grid-col ${
          reverseOrder ? "desktop:margin-right-8" : "desktop:margin-left-8"
        } margin-top-3 desktop:margin-top-0`}
      >
        {isDesktopAndUp ? (
          <img src={imageSrc} alt={imageAlt} />
        ) : (
          <div className="text-base-dark margin-bottom-2">{supportingText}</div>
        )}
      </div>
    </div>
  );

  const renderCard = (
    color: string,

    headerLine1: string,
    headerLine2: string,
    supportingText: string,
    buttonLink: string,
    buttonText: string,
    buttonStyleProp: string,
    intercom?: boolean
  ) => (
    <div className={`landing-card border-${color} border-top-105`}>
      <div className="flex flex-column fac space-between padding-x-2 padding-y-6 height-full">
        <div className="text-center">
          <h3 className="margin-0">{headerLine1}</h3>
          <h3 className="margin-bottom-3">{headerLine2}</h3>
          <div>{supportingText}</div>
        </div>
        <div>
          <Link href={buttonLink} passHref>
            <button
              className={`usa-button usa-button btn-${buttonStyleProp} ${intercom ? "intercom-button" : ""}`}
            >
              {buttonText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <PageSkeleton home={true} isWidePage>
      <NavBar landingPage={true} />
      <main data-testid="main">
        <Hero
          onClick={() => {
            router.push("/onboarding");
            analytics.event.landing_page_hero_get_started.click.go_to_onboarding();
          }}
        />

        <section aria-label="How it works">
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
                } `}
              ></div>
              <div className="margin-x-3">
                <img className="" src="/img/Landing-checkmarks.svg" alt="checklist" />
                <div className="text-accent-cool-darker width-card margin-top-2">
                  {landingPageConfig.section4SecondIconText}
                </div>
              </div>
              <div
                className={`arrow ${isDesktopAndUp ? "left width-15 height-10" : "up height-5 margin-y-3"} `}
              ></div>{" "}
              <div className="margin-x-3">
                <img className="" src="/img/Landing-building.svg" alt="government building" />
                <div className="text-accent-cool-darker width-card margin-top-2">
                  {landingPageConfig.section4ThirdIconText}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="Available Tools"
          className="desktop:grid-container-widescreen padding-x-2 padding-top-2 padding-bottom-5 desktop:padding-x-7 desktop:padding-top-0 width-100 desktop:padding-bottom-205"
        >
          <div className="desktop:padding-x-8">
            <div className="padding-top-205 ">
              {renderTwoColumnRow(
                landingPageConfig.section5FirstHeaderText,
                landingPageConfig.section5FirstSupportingText,
                "/img/Landing-step-by-step.svg",
                "step by step guide"
              )}
            </div>
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
          </div>
        </section>

        <section aria-label="Looking for more support?">
          <div className="bg-base-extra-light padding-x-2 desktop:padding-x-0 desktop:padding-bottom-10">
            <div className="desktop:grid-container-widescreen flex flex-column flex-align-center">
              <h2 className="base-darkest margin-top-7 text-center margin-bottom-5 desktop:margin-top-10 desktop:margin-bottom-8">
                {landingPageConfig.section6Header}
              </h2>
              <div className={`${isDesktopAndUp ? "flex flex-row" : ""}`}>
                {renderCard(
                  "primary",
                  landingPageConfig.card1HeaderLine1,
                  landingPageConfig.card1HeaderLine2,
                  landingPageConfig.card1SupportingText,
                  landingPageConfig.card1ButtonLink,
                  landingPageConfig.card1Button,
                  "primary"
                )}
                <div className={`${isDesktopAndUp ? "desktop:margin-x-6" : "margin-y-2"}`}>
                  {renderCard(
                    "accent-cooler",

                    landingPageConfig.card2HeaderLine1,
                    landingPageConfig.card2HeaderLine2,
                    landingPageConfig.card2SupportingText,
                    landingPageConfig.card2ButtonLink,
                    landingPageConfig.card2Button,
                    "accent-cooler"
                  )}
                </div>
                {renderCard(
                  "info-dark",

                  landingPageConfig.card3HeaderLine1,
                  landingPageConfig.card3HeaderLine2,
                  landingPageConfig.card3SupportingText,
                  "",
                  landingPageConfig.card3Button,
                  "info",
                  true
                )}
              </div>
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
