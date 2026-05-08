import { notFound } from "next/navigation";

import { loadPageBySlug } from "@/domain/content/loadContent";
import { hasAppLocale } from "@/domain/i18n/locales";

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

  const page = loadPageBySlug("business-names");

  if (!page) {
    notFound();
  }

  return (
    <main className="grid-container usa-section">
      <h1>{page.name}</h1>
      <p className="usa-intro">{page["sub-heading-text"]}</p>
      <section>
        <p>{page["main-text-1"]}</p>
      </section>
      <h2>{page["heading-2"]}</h2>
      <section>
        <p>{page["main-text-2"]}</p>
      </section>
      <h2>{page["heading-3"]}</h2>
      <section>
        <p>{page["main-text-3"]}</p>
      </section>
      <h2>{page["heading-4"]}</h2>
      <section>
        <p>{page["main-text-4"]}</p>
      </section>
      <h2>{page["heading-5"]}</h2>
      <section>
        <p>{page["main-text-5"]}</p>
      </section>
    </main>
  );
};

export default BusinessNamesPage;
