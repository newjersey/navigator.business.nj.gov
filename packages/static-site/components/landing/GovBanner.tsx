/**
 * Renders the government identity banner at the top of the landing page.
 *
 * This module maps banner links and labels from localized content into NJWDS
 * banner markup.
 */

import Image from "next/image";

import type { LayoutBannerContent } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

/**
 * Public path for the synced NJWDS SVG sprite.
 */
const NJWDS_SPRITE_PATH = "/assets/njwds/dist/img/sprite.svg";

/**
 * Describes the props used to render the government banner.
 *
 * Keep banner content typed so all required links and labels are present
 * before render time.
 */
export interface GovBannerProps {
  /** Localized banner content. */
  readonly content: LayoutBannerContent;
}

/**
 * Maps typed banner content into NJWDS banner markup.
 *
 * @param props Component props.
 * @param props.content Localized banner labels and links.
 * @returns The banner section element.
 * @example
 * ```tsx
 * <GovBanner content={landing.banner} />
 * ```
 */
export const GovBanner = ({ content }: GovBannerProps) => {
  return (
    <section aria-label={content.sectionAriaLabel} className="nj-banner">
      <div className="nj-banner__header">
        <div className="grid-container">
          <div className="nj-banner__inner">
            <div className="grid-col-auto">
              <Image
                alt={content.stateSealAlt}
                className="nj-margin-inline-end-1"
                height={36}
                src="/state-seal-2px.png"
                width={36}
              />
            </div>
            <div className="grid-col-fill">
              <LocalizedLink link={content.stateSiteLink} />
            </div>
            <ul className="grid-col-auto display-flex flex-align-center nj-inline-separators">
              <li>
                <LocalizedLink link={content.governorIdentityLink}>
                  <bdi dir="ltr">{content.governorIdentityLink.label}</bdi>
                </LocalizedLink>
              </li>
              <li className="grid-col-auto">
                <LocalizedLink
                  className="display-flex flex-align-center"
                  link={content.updatesLink}
                >
                  <svg
                    aria-hidden="true"
                    className="usa-icon usa-icon--size-3 nj-banner__mail-icon nj-margin-inline-end-05"
                    focusable="false"
                  >
                    <use xlinkHref={`${NJWDS_SPRITE_PATH}#mail`} />
                  </svg>
                  {content.updatesLink.label}
                </LocalizedLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
