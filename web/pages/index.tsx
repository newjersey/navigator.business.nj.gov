import Link from "next/link";
import React, { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LandingPage } from "@/display-content/LandingPage";
import { LegalMessage } from "@/display-content/FooterLegalMessage";

const Home = (): ReactElement => {
  const { userData } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (userData?.formProgress === "COMPLETED") {
      router.replace("/roadmap");
    }
  }, [userData]);

  return (
    <PageSkeleton>
      <Hero
        calloutText={LandingPage.heroCalloutFirstLineText}
        subCalloutText={LandingPage.heroCalloutSecondLineText}
        supportingText={LandingPage.heroSupportingText}
        callToActionText={LandingPage.herocallToActionText}
        onClick={() => {
          router.push("/signup");
        }}
      />

      <div className="landsection-2 landsection-2-bg height-34 contain-bg">
        <div className="landsection-2-content grid-desktop">
          <h1 className="landsection-2-header text-align-center no-top-bottom-margin padding-bottom-40 fixed-width no-padding-lr">
            {LandingPage.section2HeaderFirstLineText}
            <span className="landsection2-heading-alt display-inline-lscreen">
              {" "}
              {LandingPage.section2HeaderSecondLineText}{" "}
            </span>
            <span className="landsection2-heading-alt">{LandingPage.section2HeaderThirdLineText}</span>
          </h1>

          <div className="landsection2-image img-desktop">
            <img src="../img/Landing-sec2-people.png" alt="People" />
          </div>

          <p className="small-font text-align-center padding-20 p-desktop">
            {LandingPage.section2SupportingText}
          </p>

          <div className="landsection2-icons-container icon-container-desktop">
            <div className="landsection2-icon">
              <img src="../img/Icon-legal-structure.svg" alt="Legal Structure Icon" />
              <p>{LandingPage.section2Icon1Text}</p>
            </div>
            <div className="landsection2-icon">
              <img src="../img/Icon-industry.svg" alt="Industry Icon" />
              <p>{LandingPage.section2Icon2Text}</p>
            </div>
            <div className="landsection2-icon">
              <img src="../img/Icon-Location.svg" alt="Location Icon" />
              <p>{LandingPage.section2Icon3Text}</p>
            </div>
          </div>
        </div>
      </div>

      <SinglePageLayout>
        <h1 className="text-align-center font-32 top-padding line-height no-padding-top">
          {LandingPage.section3HeaderFirstLineText}
          <span className="display-block display-inline-lscreen display-inline-desktop">
            {LandingPage.section3HeaderSecondLineText}
          </span>
        </h1>

        <ul className="usa-card-group keep-flex-column">
          <li className="usa-card usa-card--header-first tablet:grid-col">
            <div className="usa-card__container items-align-center lr-margin card-container-nj-style desktop-wh">
              <header className="usa-card__header padding-top-4 padding-top-1">
                <h2 className="usa-card__heading dark-green-text text-align-center">
                  {LandingPage.column1Header}
                </h2>
              </header>
              <div className="usa-card__body text-align-center card-padding no-padding-lr padding-bottom-5">
                <p>{LandingPage.column1SupportingText}</p>
              </div>

              <div className="usa-card__footer card-footer-padding">
                <Link href="https://business.nj.gov/">
                  <button className="usa-button usa-button--outline">{LandingPage.column1Button}</button>
                </Link>
              </div>

              <div className="usa-card__media usa-card__media--inset card-media-padding">
                <div className="usa-card__img white-background img-width-250">
                  <img src="../img/Not-Starting-1-visit-site.svg" alt="Visit Business.NJ.gov site icon" />
                </div>
              </div>
            </div>
          </li>

          <li className="usa-card usa-card--header-first tablet:grid-col">
            <div className="usa-card__container items-align-center lr-margin card-container-nj-style desktop-wh">
              <header className="usa-card__header padding-top-4 padding-top-1">
                <h2 className="usa-card__heading dark-green-text text-align-center ">
                  {LandingPage.column2Header}
                </h2>
              </header>
              <div className="usa-card__body text-align-center card-padding no-padding-lr padding-bottom-2">
                <p>{LandingPage.column2SupportingText}</p>
              </div>

              <div className="usa-card__footer card-footer-padding">
                <Link href="https://business.nj.gov/newsletter-signup">
                  <button className="usa-button usa-button--outline">{LandingPage.column2Button}</button>
                </Link>
              </div>

              <div className="usa-card__media usa-card__media--inset card-media-padding">
                <div className="usa-card__img white-background img-width-250">
                  <img src="../img/Not-Starting-2-newsletter.svg" alt="Sign up for our newsletter icon" />
                </div>
              </div>
            </div>
          </li>

          <li className="usa-card usa-card--header-first tablet:grid-col">
            <div className="usa-card__container items-align-center lr-margin card-container-nj-style desktop-wh">
              <header className="usa-card__header padding-top-4 padding-top-1">
                <h2 className="usa-card__heading dark-green-text text-align-center">
                  {LandingPage.column3Header}
                </h2>
              </header>
              <div className="usa-card__body text-align-center card-padding no-padding-lr padding-bottom-12">
                <p>{LandingPage.column3SupportingText}</p>
              </div>

              <div className="usa-card__footer card-footer-padding">
                <button className="usa-button usa-button--outline intercom-button">
                  {LandingPage.column3Button}
                </button>
              </div>

              <div className="usa-card__media usa-card__media--inset card-media-padding">
                <div className="usa-card__img white-background img-width-250">
                  <img
                    src="../img/Not-Starting-3-chat.svg"
                    alt="Chat with a New Jersey representative icon"
                  />
                </div>
              </div>
            </div>
          </li>
        </ul>
        <div className="greenDividerCenter"></div>
        <div className="legalMessage">
          <p>{LegalMessage.legalMessageText}</p>
        </div>
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export default Home;
