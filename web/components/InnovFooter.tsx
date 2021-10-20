import React, { ReactElement } from "react";
import { Footer } from "@/display-content/Footer";
import { Icon } from "@/components/njwds/Icon";

export const InnovFooter = (): ReactElement => {
  return (
    <div className="usa-identifier">
      <div className="display-flex flex-column margin-x-auto fac padding-top-105 footer-custom">
        <section
          className="usa-identifier__section usa-identifier__section--usagov "
          aria-label="New Jersey Office of Innovation information and services"
        >
          <div className="usa-identifier__container">
            <p className="footer-container">
              <span>
                <a
                  href={Footer.linkOne}
                  className="usa-identifier__required-link padding-right-1 footer-link-custom"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Footer.linkOneText}
                </a>
              </span>
              <span>
                <a
                  href={Footer.linkTwo}
                  className="usa-identifier__required-link padding-x-1 footer-link-custom"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Footer.linkTwoText}
                </a>
              </span>
              <span>
                <a
                  href={Footer.linkThree}
                  className="usa-identifier__required-link padding-left-1 footer-link-custom"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Footer.linkThreeText}
                </a>
              </span>
            </p>

            <p className="footer-container footer-divider-top padding-y-105 footer-divider-bottom">
              <span className="padding-right-1">
                {Footer.officeTextOne}
                <Icon className="heart-custom">favorite</Icon>
                {Footer.officeTextTwo}
                <a
                  href={Footer.officeLink}
                  target="_blank"
                  className="usa-identifier__required-link footer-link-custom"
                  rel="noreferrer"
                >
                  {Footer.officeLinkText}
                </a>
              </span>

              <span className="padding-left-1 display-block-mobile display-inline-desktop">
                {Footer.creditText}
                <a
                  href={Footer.creditLink}
                  target="_blank"
                  className="usa-identifier__required-link footer-link-custom"
                  rel="noreferrer"
                >
                  {Footer.creditLinkText}
                </a>
              </span>
            </p>
          </div>
        </section>

        <section
          className="usa-identifier__section usa-identifier__section--masthead"
          aria-label="Social media"
        >
          <div className="usa-identifier__container display-flex flex-column fac footer-container-external">
            <div className="usa-identifier__identity">
              <p className="usa-identifier__identity-domain"></p>
              <p className="usa-identifier__identity-disclaimer footer-text-custom">
                {Footer.officeExternalText}
              </p>
            </div>

            <div className="usa-identifier__logos margin-right-none">
              <a
                href={Footer.gitHubLink}
                className="usa-identifier__logo"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <Icon className="icon-custom margin-top-1">github</Icon>
              </a>
              <a
                href={Footer.twitterLink}
                className="usa-identifier__logo"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                <Icon className="icon-custom margin-top-1">twitter</Icon>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
