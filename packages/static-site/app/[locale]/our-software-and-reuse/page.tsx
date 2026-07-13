/**
 * Implements the "Our Software and Reuse" page route.
 *
 * This route provides information about the technology stack, licensing,
 * and reuse guidelines for Business.NJ.gov.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { hasAppLocale } from "@/domain/i18n/locales";

/**
 * Describes route params for the software and reuse page.
 */
interface SoftwareReusePageParams {
  /** Locale segment captured from the route. */
  readonly locale: string;
}

/**
 * Describes props accepted by the software and reuse page component.
 */
interface SoftwareReusePageProps {
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<SoftwareReusePageParams>;
}

/**
 * Generates metadata for the software and reuse page.
 */
export const generateMetadata = (): Metadata => {
  return {
    alternates: buildAlternateLanguages({ pathnameWithoutLocale: "/our-software-and-reuse" }),
  };
};

/**
 * Renders the Our Software and Reuse page.
 */
const SoftwareReusePage = async ({ params }: SoftwareReusePageProps) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  // Messages not needed since content is hardcoded for now

  return (
    <div className="grid-container">
      <div className="grid-row">
        <div className="grid-col-12">
          {/* Hero Section */}
          <section className="hero-section" aria-label="Page introduction">
            <h1 className="title">Our Software and Reuse</h1>
            <p className="usa-intro subtitle">
              This page outlines the technology on which Business.NJ.gov is built and how it may be
              reused.
            </p>
          </section>

          {/* Table of Contents */}
          <nav aria-label="Page contents" className="margin-y-5 border-top border-bottom padding-bottom-3">
            <h2>Contents</h2>
            <ul className="usa-list usa-list--unstyled">
              <li>
                <a href="#open-license-statement" className="usa-link">
                  Open License Statement
                </a>
              </li>
              <li>
                <a href="#technical-details" className="usa-link">
                  Technical Details, Reuse, and Contributions
                </a>
              </li>
              <li>
                <a href="#history-and-credits" className="usa-link">
                  History and Credits
                </a>
              </li>
              <li>
                <a href="#contact-us" className="usa-link">
                  Contact Us
                </a>
              </li>
            </ul>
          </nav>

          {/* Open License Statement Section */}
          <section id="open-license-statement" className="margin-y-5">
            <h2>Open License Statement</h2>
            <p>Unless otherwise noted, content, data, and code published by the New Jersey Office of
              Innovation on this website and associated repositories are made available to promote transparency,
              collaboration, and public benefit. Third-party content and services retain their respective licenses,
              and any reproduction may be subject to applicable copyright or trademark laws.Please note that our
              name and the names of other copyright holders cannot be used to endorse or promote products derived
              from this content or software without explicit written permission.
            </p>
          </section>

          <hr/>

          {/* Technical Details Section */}
          <section id="technical-details" className="margin-y-5">
            <h2>Technical Details, Reuse, and Contributions</h2>
            <p>
              <a href="http://business.nj.gov">Business.NJ.gov</a> is part of New Jersey's initiative to assist
              businesses across the state and includes a vast amount of understandable information about
              starting and operating a business in New Jersey. It also includes a personalized account and LiveChat
              support. It is a cross-agency effort to deliver a simplified, one-stop digital experience for business
              owners.
            </p>
            <p>
              <a href="http://business.nj.gov">Business.NJ.gov</a> is currently hosted and managed on
              <a href="https://webflow.com/website/State-of-NJ-Business-One-Stop">Webflow</a>. The website’s
              template is subject to the terms required to use the Webflow service. The HTML pages are available
              for reuse via the <a href="https://github.com/newjersey/open-business-portal">Github open-business
              portal repository</a>. The <a href="https://github.com/newjersey/navigator.business.nj.gov">Github
              repository</a> for our software elements is also publicly available.
            </p>
            <p>
              To launch a copy of the static
              site, visit the <a href="https://webflow.com/website/State-of-NJ-Business-One-Stop"> Webflow showcase</a> and click "Open in Webflow".
              Content that appears on the static Business.NJ.Gov website and My Account
              is publicly browsable on <a href="https://github.com/newjersey/navigator.business.nj.gov/tree/main/content/src">Github</a>.
            </p>

            <p>To reuse and improve our digital products, we recommend:</p>
            <ul>
              <li>Forking or cloning repositories</li>
              <li>Adapting our open content and code to serve your own communities, projects, or applications</li>
              <li>Suggesting improvements for the benefit of others</li>
            </ul>

            <p>Contributions should abide by the repository’s posted code of conduct and license terms.</p>

          </section>

          <hr/>

          {/* History and Credits Section */}
          <section id="history-and-credits" className="margin-y-5">
            <h2>History and Credits</h2>
            <p>
              Business.NJ.gov is built upon the innovative work of the the Cities of <a href="https://businessportal.sfgov.org/">San Francisco</a> and
              <a href="https://business.lacity.org/">Los Angeles (LA)</a>. Their Business Portal content and code base provided the foundation for
              <a href="http://business.nj.gov/">Business.NJ.gov</a>.
            </p>
            <p>
              The original design and content for <a href="http://business.nj.gov/">Business.NJ.gov</a> were adapted from the <a href="https://business.lacity.org/">Los Angeles Business Portal</a>,
              and reuse of these materials and source code is subject to the license information found in the
              <a href="https://business.lacity.org/">Copyright section</a> of the LA Business Portal website. Explore the open-source code and project history
              from Los Angeles on the <a href="https://github.com/StartupInADay/Los-Angeles-California#the-business-portal">Startup in a Day Github Page</a>.
            </p>
            <p>
              Prior to our migration to Webflow, a Drupal version of Business.NJ.gov was also available.
              Although it is no longer maintained, it remains accessible for reference on <a href="https://github.com/newjersey/business-website">Github</a>.
            </p>
          </section>

          <hr/>

          {/* Contact Us Section */}
          <section id="contact-us" className="margin-y-5">
            <h2>Contact Us</h2>
            <p>
              Reach out or leave feedback or suggestions for us at <a href="https://business.nj.gov/feedback" className="usa-link">Business.NJ.gov/feedback</a>.
              To get in touch with the Office of Innovation team, email us at <a href="mailto:team@innovation.nj.gov" className="usa-link">team@innovation.nj.gov</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SoftwareReusePage;
