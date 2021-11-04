import React, { ReactElement } from "react";

export const IdentifierDefault = (): ReactElement => {
  return (
    <>
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
                  src="/img/nj-logo-gray-20.png"
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
                  Legal Statement & Disclaimers
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
            <div className="usa-identifier__usagov-description">Copyright © 2021 State of New Jersey</div>
          </div>
        </section>
      </div>
    </>
  );
};
