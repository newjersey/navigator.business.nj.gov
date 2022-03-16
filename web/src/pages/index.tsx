import { LegalMessage } from "@/components/LegalMessage";
import { NavBar } from "@/components/navbar/NavBar";
import { Card } from "@/components/njwds-extended/Card";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";

const Home = (): ReactElement => {
  const { userData, error } = useUserData();
  const router = useRouter();

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

  return (
    <PageSkeleton home={true}>
      <NavBar landingPage={true} />
      <main data-testid="main">
        <section aria-label="Introduction">
          <Hero
            calloutText={Config.landingPage.heroCalloutFirstLineText}
            subCalloutText={Config.landingPage.heroCalloutSecondLineText}
            supportingText={Config.landingPage.heroSupportingText}
            callToActionText={Config.landingPage.heroCallToActionText}
            onClick={() => {
              router.push("/onboarding");
              analytics.event.landing_page_hero_get_started.click.go_to_onboarding();
            }}
          />

          <div className="l2-bg height-34 bg-contain">
            <div className="grid-custom">
              <div className="l2-header-custom text-center margin-y-0 padding-bottom-40 fixed-width no-padding-lr display-block">
                <h2>
                  {Config.landingPage.section2HeaderFirstLineText}
                  <span className="display-inline-override">
                    {Config.landingPage.section2HeaderSecondLineText}
                  </span>
                  <span>{Config.landingPage.section2HeaderThirdLineText}</span>
                </h2>
              </div>

              <div className="l2-image img-desktop">
                <img src="../img/Landing-sec2-people.png" alt="People" />
              </div>
              <p className="font-sans-lg text-center padding-20 p-desktop">
                {Config.landingPage.section2SupportingText}
              </p>
              <div className="fdr fjc icon-container-desktop">
                <div className="l2-icon">
                  <img src="../img/Icon-legal-structure.svg" alt="Legal Structure Icon" />
                  <p>{Config.landingPage.section2Icon1Text}</p>
                </div>
                <div className="l2-icon">
                  <img src="../img/Icon-industry.svg" alt="Industry Icon" />
                  <p>{Config.landingPage.section2Icon2Text}</p>
                </div>
                <div className="l2-icon">
                  <img src="../img/Icon-Location.svg" alt="Location Icon" />
                  <p>{Config.landingPage.section2Icon3Text}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SinglePageLayout wrappedWithMain={false}>
          <section aria-label="Existing business">
            <div className="text-center text-bold padding-top-9 desktop:padding-top-2 line-height-205">
              <h2>
                {Config.landingPage.section3HeaderFirstLineText}
                <span className="display-block display-inline-override">
                  {Config.landingPage.section3HeaderSecondLineText}
                </span>
              </h2>
            </div>

            <ul className="usa-card-group flex-direction card-group-margin-custom">
              <Card
                headerText={Config.landingPage.column1Header}
                mainText={Config.landingPage.column1SupportingText}
                buttonText={Config.landingPage.column1Button}
                link={Config.landingPage.column1ButtonLink}
                imageSource={Config.landingPage.column1Image}
                altImageText={Config.landingPage.column1ImageAlt}
                mainTextClassName="padding-bottom-5"
              />

              <Card
                headerText={Config.landingPage.column2Header}
                mainText={Config.landingPage.column2SupportingText}
                buttonText={Config.landingPage.column2Button}
                link={Config.landingPage.column2ButtonLink}
                imageSource={Config.landingPage.column2Image}
                altImageText={Config.landingPage.column2ImageAlt}
                mainTextClassName="padding-bottom-2"
              />

              <Card
                headerText={Config.landingPage.column3Header}
                mainText={Config.landingPage.column3SupportingText}
                buttonText={Config.landingPage.column3Button}
                link={Config.landingPage.column3ButtonLink}
                imageSource={Config.landingPage.column3Image}
                altImageText={Config.landingPage.column3ImageAlt}
                buttonClassName="intercom-button"
                mainTextClassName="padding-bottom-12"
              />
            </ul>
            <div className="green-divider-center"></div>
            <div className="margin-x-3 margin-bottom-8 text-center">
              <LegalMessage />
            </div>
          </section>
        </SinglePageLayout>
      </main>
    </PageSkeleton>
  );
};

export default Home;
