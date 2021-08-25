import React, { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LandingPageDefaults } from "@/display-content/LandingPageDefaults";
import { Signup } from "@/components/Signup";
import { Card } from "@/components/njwds-extended/Card";
import { LegalMessage } from "@/components/LegalMessage";
import { NavBar } from "@/components/navbar/NavBar";

const Home = (): ReactElement => {
  const { userData, error } = useUserData();
  const router = useRouter();
  const [signupIsOpen, setSignupIsOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (userData?.formProgress === "COMPLETED") {
      router.replace("/roadmap");
    } else if (userData?.formProgress === "UNSTARTED") {
      router.replace("/onboarding");
    } else if (userData === undefined && error != undefined) {
      router.replace("/roadmap");
    }
  }, [userData]);

  return (
    <PageSkeleton>
      <NavBar landingPage={true} />
      <Hero
        calloutText={LandingPageDefaults.heroCalloutFirstLineText}
        subCalloutText={LandingPageDefaults.heroCalloutSecondLineText}
        supportingText={LandingPageDefaults.heroSupportingText}
        callToActionText={LandingPageDefaults.herocallToActionText}
        onClick={() => {
          setSignupIsOpen(true);
        }}
      />

      <Signup isOpen={signupIsOpen} onClose={() => setSignupIsOpen(false)} />

      <div className="l2-bg height-34 bg-contain">
        <div className="grid-custom">
          <h1 className="l2-header-custom text-center margin-y-0 padding-bottom-40 fixed-width no-padding-lr display-block">
            {LandingPageDefaults.section2HeaderFirstLineText}
            <span className="display-inline">{LandingPageDefaults.section2HeaderSecondLineText}</span>
            <span>{LandingPageDefaults.section2HeaderThirdLineText}</span>
          </h1>

          <div className="l2-image img-desktop">
            <img src="../img/Landing-sec2-people.png" alt="People" />
          </div>

          <p className="small-font text-center padding-20 p-desktop">
            {LandingPageDefaults.section2SupportingText}
          </p>

          <div className="fdr fjc icon-container-desktop">
            <div className="l2-icon">
              <img src="../img/Icon-legal-structure.svg" alt="Legal Structure Icon" />
              <p>{LandingPageDefaults.section2Icon1Text}</p>
            </div>
            <div className="l2-icon">
              <img src="../img/Icon-industry.svg" alt="Industry Icon" />
              <p>{LandingPageDefaults.section2Icon2Text}</p>
            </div>
            <div className="l2-icon">
              <img src="../img/Icon-Location.svg" alt="Location Icon" />
              <p>{LandingPageDefaults.section2Icon3Text}</p>
            </div>
          </div>
        </div>
      </div>

      <SinglePageLayout>
        <h1 className="text-center font-32 padding-top-8 line-height-205 no-padding-top">
          {LandingPageDefaults.section3HeaderFirstLineText}
          <span className="display-block display-inline">
            {LandingPageDefaults.section3HeaderSecondLineText}
          </span>
        </h1>

        <ul className="usa-card-group flex-direction card-group-margin-custom">
          <Card
            headerText={LandingPageDefaults.column1Header}
            mainText={LandingPageDefaults.column1SupportingText}
            buttonText={LandingPageDefaults.column1Button}
            link={LandingPageDefaults.column1ButtonLink}
            imageSource={LandingPageDefaults.column1Image}
            altImageText={LandingPageDefaults.column1ImageAlt}
            mainTextClassName="padding-bottom-5"
          />

          <Card
            headerText={LandingPageDefaults.column2Header}
            mainText={LandingPageDefaults.column2SupportingText}
            buttonText={LandingPageDefaults.column2Button}
            link={LandingPageDefaults.column2ButtonLink}
            imageSource={LandingPageDefaults.column2Image}
            altImageText={LandingPageDefaults.column2ImageAlt}
            mainTextClassName="padding-bottom-2"
          />

          <Card
            headerText={LandingPageDefaults.column3Header}
            mainText={LandingPageDefaults.column3SupportingText}
            buttonText={LandingPageDefaults.column3Button}
            link={LandingPageDefaults.column3ButtonLink}
            imageSource={LandingPageDefaults.column3Image}
            altImageText={LandingPageDefaults.column3ImageAlt}
            buttonClassName="intercom-button"
            mainTextClassName="padding-bottom-12"
          />
        </ul>
        <div className="green-divider-center"></div>
        <div className="margin-x-3 margin-bottom-8 text-center">
          <LegalMessage />
        </div>
      </SinglePageLayout>
    </PageSkeleton>
  );
};

export default Home;
