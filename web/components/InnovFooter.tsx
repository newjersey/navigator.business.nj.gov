import React, { ReactElement } from "react";
import { Footer } from "@/display-content/Footer";
import { Icon } from "@/components/njwds/Icon";


export const InnovFooter = (): ReactElement => {
    return (
        <div className="usa-identifier">
        <div className="display-flex flex-column margin-x-auto fac padding-top-2 footer-custom-desktop">

        <section className="usa-identifier__section usa-identifier__section--usagov " aria-label="U.S. government information and services">
            <div className="usa-identifier__container">
                
        <p className="footer-container footer-container-mobile">
              <span>
                <a href={Footer.linkOne} className="usa-identifier__required-link padding-right-1 footerLinkCustom" target="_blank">
                {Footer.linkOneText}
                </a>
              </span>
              <span>
                <a href={Footer.linkTwo} className="usa-identifier__required-link padding-x-1 footerLinkCustom" target="_blank">
                  {Footer.linkTwoText}
                </a>
              </span>
              <span>
                <a href={Footer.linkThree} className="usa-identifier__required-link usa-link padding-left-1 footerLinkCustom" target="_blank">
                  {Footer.linkThreeText}
                </a>
              </span>
            </p>

            <p className="footer-divider-top margin-y-2"></p>
                  <p className="footer-container footer-container-mobile margin-top-1">
                  <span className="padding-right-1">
                  {Footer.officeTextOne}
                  <Icon className="heartCustom">favorite</Icon>
                  {Footer.officeTextTwo}
                  <a href={Footer.officeLink} target="_blank" className="footerLinkCustom">{Footer.officeLinkText}</a>
                  </span>

                  <span className="padding-left-1 display-block-mobile display-inline-desktop">
                  {Footer.creditText}
                  <a href={Footer.creditLink} target="_blank" className="footerLinkCustom">{Footer.creditLinkText}</a>
                  </span>
                  </p>
            <p className="footer-divider-bottom"></p>
                </div>
        </section>

        <section
          className="usa-identifier__section usa-identifier__section--masthead"
          aria-label="Agency links"
        >
          <div className="usa-identifier__container display-flex flex-column fac footer-container-desktop">
            
            <div className="usa-identifier__identity" aria-label="Agency description">
              <p className="usa-identifier__identity-domain"></p>
              <p className="usa-identifier__identity-disclaimer footerTextCustom">
                {Footer.officeExternalText}
              </p>
            </div>

            <div className="usa-identifier__logos">
              <a href={Footer.gitHubLink} className="usa-identifier__logo" target="_blank">
                <Icon className="githubCustom margin-top-1 no-margin-right">github</Icon>
              </a>
            </div>
          </div>
        </section>

        </div>
        </div>
    );
}