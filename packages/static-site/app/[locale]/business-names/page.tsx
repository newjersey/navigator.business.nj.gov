import { notFound } from "next/navigation";

import {
  buildContentPageSectionHeadingId,
  buildContentPageTitleHeadingId,
} from "@/domain/content/headingIds";
import { loadPageBySlug } from "@/domain/content/loadContent";
import { hasAppLocale } from "@/domain/i18n/locales";

const BUSINESS_NAMES_PAGE_SLUG = "business-names";

interface PageParams {
  readonly locale: string;
}

interface Props {
  readonly params: Promise<PageParams>;
}

const BusinessNamesPage = async ({ params }: Props) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const page = loadPageBySlug(BUSINESS_NAMES_PAGE_SLUG);

  if (!page) {
    notFound();
  }

  return (
    <main className="grid-container usa-section">
      <h1 id={buildContentPageTitleHeadingId({ pageSlug: BUSINESS_NAMES_PAGE_SLUG })}>
        {page.name}
      </h1>
      <p className="usa-intro">{page["sub-heading-text"]}</p>
      <section>
        <p>{page["main-text-1"]}</p>
      </section>
      <h2
        id={buildContentPageSectionHeadingId({
          pageSlug: BUSINESS_NAMES_PAGE_SLUG,
          sectionNumber: 2,
        })}
      >
        {page["heading-2"]}
      </h2>
      <section>
        <p>{page["main-text-2"]}</p>
      </section>
      <h2
        id={buildContentPageSectionHeadingId({
          pageSlug: BUSINESS_NAMES_PAGE_SLUG,
          sectionNumber: 3,
        })}
      >
        {page["heading-3"]}
      </h2>
      <section>
        <p>{page["main-text-3"]}</p>
      </section>
      <h2
        id={buildContentPageSectionHeadingId({
          pageSlug: BUSINESS_NAMES_PAGE_SLUG,
          sectionNumber: 4,
        })}
      >
        {page["heading-4"]}
      </h2>
      <section>
        <p>{page["main-text-4"]}</p>
      </section>
      <h2
        id={buildContentPageSectionHeadingId({
          pageSlug: BUSINESS_NAMES_PAGE_SLUG,
          sectionNumber: 5,
        })}
      >
        {page["heading-5"]}
      </h2>
      <section>
        <p>{page["main-text-5"]}</p>
      </section>
    </main>
  );
};

export default BusinessNamesPage;
