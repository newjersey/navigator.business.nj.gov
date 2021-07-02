import Link from "next/link";
import React, { ReactElement, useEffect } from "react";
import { useRouter } from "next/router";
import { Hero } from "@/components/njwds/Hero";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AuthButton } from "@/components/AuthButton";
import { SinglePageLayout } from "@/components/njwds-extended/SinglePageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";

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
      <div className="header padding-header">
        <div className="auth-button">
          <AuthButton />
        </div>
      </div>

      <Hero
        calloutText="Your Business,"
        subCalloutText=" Your Guide"
        supportingText="Get your free, personalized roadmap to start your new business in New Jersey."
        callToActionText="Get started"
        onClick={() => {
          router.push("/onboarding");
        }}
      />

      <div className="landsection-2 landsection-2-bg height-34 contain-bg">
        <div className="landsection-2-content grid-desktop">
          <h1 className="landsection-2-header text-align-center no-top-bottom-margin padding-bottom-40 fixed-width no-padding-lr">
            Starting a business in New
            <span className="landsection2-heading-alt display-inline-lscreen"> Jersey has never been </span>
            <span className="landsection2-heading-alt">faster or easier!</span>
          </h1>

          <div className="landsection2-image img-desktop">
            <img src="../img/Landing-sec2-people.png" alt="People" />
          </div>

          <p className="small-font text-align-center padding-20 p-desktop">
            We will give you a step-by-step guide to help get your business up and running. We’ll ask you a
            few onboarding questions, be prepared to tell us your business’:
          </p>

          <div className="landsection2-icons-container icon-container-desktop">
            <div className="landsection2-icon">
              <img src="../img/Icon-legal-structure.svg" alt="Legal Structure Icon" />
              <p>Legal Structure</p>
            </div>
            <div className="landsection2-icon">
              <img src="../img/Icon-industry.svg" alt="Industry Icon" />
              <p>Industry</p>
            </div>
            <div className="landsection2-icon">
              <img src="../img/Icon-Location.svg" alt="Location Icon" />
              <p>Location</p>
            </div>
          </div>
        </div>
      </div>

      <SinglePageLayout>
        <h1 className="text-align-center font-32 top-padding line-height no-padding-top">
          Not Starting Your
          <span className="display-block display-inline-lscreen display-inline-desktop"> Business?</span>
        </h1>

        <ul className="usa-card-group keep-flex-column">
          <li className="usa-card usa-card--header-first tablet:grid-col">
            <div className="usa-card__container items-align-center lr-margin card-container-nj-style desktop-wh">
              <header className="usa-card__header padding-top-4 padding-top-1">
                <h2 className="usa-card__heading dark-green-text text-align-center">
                  Explore Business.NJ.gov
                </h2>
              </header>
              <div className="usa-card__body text-align-center card-padding no-padding-lr padding-bottom-5">
                <p>Visit our website with more resources to start, operate, and grow your business.</p>
              </div>

              <div className="usa-card__footer card-footer-padding">
                <Link href="https://business.nj.gov/">
                  <button className="usa-button usa-button--outline">Visit the Site</button>
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
                  Sign Up for Our Newsletter
                </h2>
              </header>
              <div className="usa-card__body text-align-center card-padding no-padding-lr padding-bottom-2">
                <p>
                  Already a registered business and want to know the lastest grants and regulations likely to
                  affect your business? Join our weekly newsletter.
                </p>
              </div>

              <div className="usa-card__footer card-footer-padding">
                <Link href="https://business.nj.gov/newsletter-signup">
                  <button className="usa-button usa-button--outline">Sign Up</button>
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
                  Chat with a New Jersey Representative
                </h2>
              </header>
              <div className="usa-card__body text-align-center card-padding no-padding-lr padding-bottom-12">
                <p>
                  Local representatives are available 9a.m-5p.m, Monday - Friday to help you with any business
                  challenge. 9a.m.-5p.m. eastern time.
                </p>
              </div>

              <div className="usa-card__footer card-footer-padding">
                <button className="usa-button usa-button--outline intercom-button">Start chatting</button>
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
          <p>
            The informations shared through MyBizNJ is a guide and should not take the place of legal or tax
            advice. We recommend the consultation of a lawyer, accountant, and an insurance agent when forming
            a business. You can also seek additional support by contacting your local Small Business
            Development Center.
          </p>
        </div>
      </SinglePageLayout>
      <div className="usa-identifier">
        <section
          className="usa-identifier__section usa-identifier__section--masthead"
          aria-label="Agency identifier"
        >
          <div className="usa-identifier__container">
            <div className="usa-identifier__logos">
              <a href="https://nj.gov" className="usa-identifier__logo">
                <img
                  className="usa-identifier__logo-img"
                  src="../img/nj-logo-gray-20.png"
                  alt="the State of New Jersey logo"
                />
              </a>
            </div>
            <div className="usa-identifier__identity" aria-label="Agency description">
              <p className="usa-identifier__identity-domain"></p>
              <p className="usa-identifier__identity-disclaimer">
                An official website of the <a href="https://nj.gov">the State of New Jersey</a>
              </p>
            </div>
          </div>
        </section>

        <nav
          className="usa-identifier__section usa-identifier__section--required-links"
          aria-label="Important links"
        >
          <div className="usa-identifier__container">
            <ul className="usa-identifier__required-links-list">
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/governor/admin/about/" className="usa-identifier__required-link">
                  Governor Phil Murphy
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/governor/admin/lt/" className="usa-identifier__required-link">
                  Lt. Governor Sheila Oliver
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/" className="usa-identifier__required-link usa-link">
                  NJ Home
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a
                  href="https://nj.gov/nj/gov/njgov/alphaserv.html"
                  className="usa-identifier__required-link usa-link"
                >
                  Services A to Z
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/nj/gov/deptserv/" className="usa-identifier__required-link usa-link">
                  Departments/Agencies
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/faqs/" className="usa-identifier__required-link usa-link">
                  FAQs
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/nj/feedback.html" className="usa-identifier__required-link usa-link">
                  Contact Us
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/nj/privacy.html" className="usa-identifier__required-link usa-link">
                  Privacy Notice
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/nj/legal.html" className="usa-identifier__required-link usa-link">
                  Legal Statement and Disclaimers
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a
                  href="https://nj.gov/nj/accessibility.html"
                  className="usa-identifier__required-link usa-link"
                >
                  Accessibility
                </a>
              </li>
              <li className="usa-identifier__required-links-item">
                <a href="https://nj.gov/opra/" className="usa-identifier__required-link usa-link">
                  Open Public Records Act (OPRA)
                </a>
              </li>
            </ul>
          </div>
        </nav>
        <section
          className="usa-identifier__section usa-identifier__section--usagov"
          aria-label="U.S. government information and services"
        >
          <div className="usa-identifier__container">
            <div className="usa-identifier__usagov-description">Copyright © 2020 State of New Jersey</div>
          </div>
        </section>
      </div>
    </PageSkeleton>
  );
};

export default Home;
