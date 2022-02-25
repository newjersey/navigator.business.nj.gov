import { LegalMessage } from "@/components/LegalMessage";
import { NavBar } from "@/components/navbar/NavBar";
import { Card } from "@/components/njwds-extended/Card";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Signup } from "@/components/Signup";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";

const Home = (): ReactElement => {
  const { userData, error } = useUserData();
  const router = useRouter();
  const [signupIsOpen, setSignupIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (userData?.formProgress === "COMPLETED") {
      if (userData?.profileData.hasExistingBusiness) {
        router.replace("/dashboard");
      } else {
        router.replace("/roadmap");
      }
    } else if (userData?.formProgress === "UNSTARTED") {
      if (
        !!process.env.MYNJ_PROFILE_LINK &&
        document.referrer.includes(process.env.MYNJ_PROFILE_LINK.split("/", 3).join("/"))
      ) {
        analytics.event.onboarding_first_step.arrive.arrive_from_myNJ_registration();
      }
      router.replace("/onboarding");
    } else if (userData === undefined && error != undefined) {
      router.replace("/roadmap?error=true");
    }
  }, [userData, error, router]);

  useEffect(() => {
    if (!router.isReady || !router.query.signUp) return;
    setSignupIsOpen(router.query.signUp === "true");
  }, [router.isReady, router.query]);

  return (
    <PageSkeleton home={true}>
      <NavBar landingPage={true} />
      <main data-testid="main">
        <section aria-label="Introduction">
          <Hero
            calloutText={Defaults.landingPage.heroCalloutFirstLineText}
            subCalloutText={Defaults.landingPage.heroCalloutSecondLineText}
            supportingText={Defaults.landingPage.heroSupportingText}
            callToActionText={Defaults.landingPage.heroCallToActionText}
            onClick={() => {
              setSignupIsOpen(true);
              analytics.event.landing_page_hero_get_started.click.open_create_account_modal();
            }}
          />

          <Signup isOpen={signupIsOpen} onClose={() => setSignupIsOpen(false)} />

          <div className="l2-bg height-34 bg-contain">
            <div className="grid-custom">
              <div className="l2-header-custom text-center margin-y-0 padding-bottom-40 fixed-width no-padding-lr display-block">
                <h2>
                  {Defaults.landingPage.section2HeaderFirstLineText}
                  <span className="display-inline-override">
                    {Defaults.landingPage.section2HeaderSecondLineText}
                  </span>
                  <span>{Defaults.landingPage.section2HeaderThirdLineText}</span>
                </h2>
              </div>

              <div className="l2-image img-desktop">
                <img src="../img/Landing-sec2-people.png" alt="People" />
              </div>
              <p className="font-sans-lg text-center padding-20 p-desktop">
                {Defaults.landingPage.section2SupportingText}
              </p>
              <div className="fdr fjc icon-container-desktop">
                <div className="l2-icon">
                  <img src="../img/Icon-legal-structure.svg" alt="Legal Structure Icon" />
                  <p>{Defaults.landingPage.section2Icon1Text}</p>
                </div>
                <div className="l2-icon">
                  <img src="../img/Icon-industry.svg" alt="Industry Icon" />
                  <p>{Defaults.landingPage.section2Icon2Text}</p>
                </div>
                <div className="l2-icon">
                  <img src="../img/Icon-Location.svg" alt="Location Icon" />
                  <p>{Defaults.landingPage.section2Icon3Text}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SinglePageLayout wrappedWithMain={false}>
          <section aria-label="Existing business">
            <div className="text-center text-bold padding-top-9 desktop:padding-top-2 line-height-205">
              <h2>
                {Defaults.landingPage.section3HeaderFirstLineText}
                <span className="display-block display-inline-override">
                  {Defaults.landingPage.section3HeaderSecondLineText}
                </span>
              </h2>
            </div>

            <ul className="usa-card-group flex-direction card-group-margin-custom">
              <Card
                headerText={Defaults.landingPage.column1Header}
                mainText={Defaults.landingPage.column1SupportingText}
                buttonText={Defaults.landingPage.column1Button}
                link={Defaults.landingPage.column1ButtonLink}
                imageSource={Defaults.landingPage.column1Image}
                altImageText={Defaults.landingPage.column1ImageAlt}
                mainTextClassName="padding-bottom-5"
              />

              <Card
                headerText={Defaults.landingPage.column2Header}
                mainText={Defaults.landingPage.column2SupportingText}
                buttonText={Defaults.landingPage.column2Button}
                link={Defaults.landingPage.column2ButtonLink}
                imageSource={Defaults.landingPage.column2Image}
                altImageText={Defaults.landingPage.column2ImageAlt}
                mainTextClassName="padding-bottom-2"
              />

              <Card
                headerText={Defaults.landingPage.column3Header}
                mainText={Defaults.landingPage.column3SupportingText}
                buttonText={Defaults.landingPage.column3Button}
                link={Defaults.landingPage.column3ButtonLink}
                imageSource={Defaults.landingPage.column3Image}
                altImageText={Defaults.landingPage.column3ImageAlt}
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
