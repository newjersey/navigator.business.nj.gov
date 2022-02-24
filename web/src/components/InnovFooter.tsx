import { Icon } from "@/components/njwds/Icon";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";

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
                  href={Defaults.footer.linkOne}
                  className="usa-identifier__required-link padding-right-1 footer-link-custom"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Defaults.footer.linkOneText}
                </a>
              </span>
              <span>
                <a
                  href={Defaults.footer.linkTwo}
                  className="usa-identifier__required-link padding-x-1 footer-link-custom"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Defaults.footer.linkTwoText}
                </a>
              </span>
              <span>
                <a
                  href={Defaults.footer.linkThree}
                  className="usa-identifier__required-link padding-left-1 footer-link-custom"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Defaults.footer.linkThreeText}
                </a>
              </span>
            </p>

            <p className="footer-container footer-divider-top padding-y-105 footer-divider-bottom">
              <span className="padding-right-1">
                {Defaults.footer.officeTextOne}
                <Icon className="heart-custom">favorite</Icon>
                {Defaults.footer.officeTextTwo}
                <a
                  href={Defaults.footer.officeLink}
                  target="_blank"
                  className="usa-identifier__required-link footer-link-custom"
                  rel="noreferrer"
                >
                  {Defaults.footer.officeLinkText}
                </a>
              </span>

              <span className="padding-left-1 display-block-mobile display-inline-desktop">
                {Defaults.footer.creditText}
                <a
                  href={Defaults.footer.creditLink}
                  target="_blank"
                  className="usa-identifier__required-link footer-link-custom"
                  rel="noreferrer"
                >
                  {Defaults.footer.creditLinkText}
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
                {Defaults.footer.officeExternalText}
              </p>
            </div>

            <div className="usa-identifier__logos margin-right-none">
              <a
                href={Defaults.footer.gitHubLink}
                className="usa-identifier__logo"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
              >
                <Icon className="icon-custom margin-top-1">github</Icon>
              </a>
              <a
                href={Defaults.footer.twitterLink}
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
