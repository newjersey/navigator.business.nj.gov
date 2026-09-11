import { Fragment, type ReactNode } from "react";
import { CollapsibleSection } from "@/components/learn/CollapsibleSection";
import { PageContentsNav } from "@/components/learn/PageContentsNav";
import { PageSectionLinkButton } from "@/components/learn/PageSectionLinkButton";
import { PageProse } from "@/components/learn/pageMarkdown";
import {
  buildContentsEntries,
  type PlasticBanSection,
  parsePlasticBanSections,
} from "@/components/learn/parsePlasticBanSections";
import type { PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

interface Props {
  readonly page: PageItem;
  readonly locale: AppLocale;
}

interface RenderSectionParams {
  /** The section to render. */
  readonly section: PlasticBanSection;
}

/** Renders a section's body prose and, if authored, its call-to-action button. */
const renderSectionContent = ({ section }: RenderSectionParams): ReactNode => (
  <>
    {section.body && <PageProse body={section.body} />}
    {section.linkText && section.linkUrl && (
      <PageSectionLinkButton text={section.linkText} url={section.linkUrl} />
    )}
  </>
);

/**
 * Renders one section as a collapsible accordion (when `collapsible-N` names
 * a recognized state and a heading is authored) or as a plain, always-visible
 * section otherwise. A trailing `<hr>` divides it from the next section
 * regardless of type, so a collapsible section is visually separated from
 * what follows just like a plain one.
 */
const renderSection = ({ section }: RenderSectionParams): ReactNode => {
  if (section.collapse && section.heading) {
    return (
      <Fragment key={section.index}>
        <CollapsibleSection
          defaultOpen={section.collapse === "open"}
          heading={section.heading}
          sectionId={section.id}
        >
          {renderSectionContent({ section })}
        </CollapsibleSection>
        <hr></hr>
      </Fragment>
    );
  }

  return (
    <Fragment key={section.index}>
      <section id={section.id}>
        {section.heading && <h2>{section.heading}</h2>}
        {renderSectionContent({ section })}
      </section>
      <hr></hr>
    </Fragment>
  );
};

/**
 * Renders the plastic-ban-law page: an always-open intro, a mix of plain and
 * collapsible sections, and a curated Contents jump-link rail. See
 * `parsePlasticBanSections.ts` for the frontmatter conventions this page
 * introduces (`collapsible-N`, `contents-label-N`).
 */
export const PlasticBanPage = ({ page, locale }: Props) => {
  const { learn: messages } = getApplicationMessages({ locale });
  const sections = parsePlasticBanSections(page);
  const contentsEntries = buildContentsEntries(sections);

  return (
    <div className="usa-in-page-nav-container plastic-ban-law-page layout-wide">
      <article className="plastic-ban-law-page__body">
        <h1>{page.name}</h1>
        {page["sub-heading-text"] && <p className="usa-intro">{page["sub-heading-text"]}</p>}
        {sections.map((section) => renderSection({ section }))}
      </article>
      <PageContentsNav entries={contentsEntries} heading={messages.pageContentsHeading} />
    </div>
  );
};
