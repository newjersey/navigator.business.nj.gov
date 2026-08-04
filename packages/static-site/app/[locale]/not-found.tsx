import type { Metadata } from "next";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { LocalizedLink } from "@/components/landing/LocalizedLink";
import { resolveAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { SITE_TITLE_SUFFIX } from "@/domain/siteConfig";

/**
 * Generates a branded, localized title for the 404 page.
 *
 * @returns Metadata with a title matching the page's own `<h1>` in the visitor's locale.
 */
export const generateMetadata = async (): Promise<Metadata> => {
  const locale = resolveAppLocale({ locale: await getLocale() });
  const { pageNotFound } = getApplicationMessages({ locale });

  return { title: { absolute: `${pageNotFound.title} | ${SITE_TITLE_SUFFIX}` } };
};

const PageNotFound = async () => {
  const locale = resolveAppLocale({ locale: await getLocale() });
  const { pageNotFound } = getApplicationMessages({ locale });

  return (
    <div className="page-not-found grid-container usa-section display-flex flex-column flex-align-center text-align-center">
      <Image
        className="margin-bottom-5"
        alt={pageNotFound.iconAlt}
        height={134}
        priority
        src="/img/404-page-not-found-icon.svg"
        width={134}
      />
      <h1>{pageNotFound.title}</h1>
      <p>{pageNotFound.description}</p>
      <p>
        {pageNotFound.returnToPrefix}{" "}
        <LocalizedLink className="page-not-found__home-link" link={pageNotFound.homeLink} />{" "}
        {pageNotFound.orConnector}{" "}
        <button className="text-link-button intercomlaunch" type="button">
          {pageNotFound.chatWithExpertLabel}
        </button>
        .
      </p>
    </div>
  );
};

export default PageNotFound;
