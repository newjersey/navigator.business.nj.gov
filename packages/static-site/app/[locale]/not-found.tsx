import Image from "next/image";
import { getLocale } from "next-intl/server";
import { LocalizedLink } from "@/components/landing/LocalizedLink";
import { resolveAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

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
