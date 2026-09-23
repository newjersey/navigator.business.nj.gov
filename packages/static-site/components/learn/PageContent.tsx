import { CollapsibleSection } from "@/components/learn/CollapsibleSection";
import {
	PageContentsNav,
	type PageContentsNavEntry,
} from "@/components/learn/PageContentsNav";
import { PageSectionLinkButton } from "@/components/learn/PageSectionLinkButton";
import { PageProse } from "@/components/learn/pageMarkdown";
import { MAX_PAGE_SECTION_INDEX, type PageItem } from "@/domain/content/types";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { Fragment, type ReactNode } from "react";

interface Props {
	readonly page: PageItem;
	readonly locale: AppLocale;
}

type SectionCollapse = "open" | "closed";

/**
 * Indexed section fields read off `PageItem`. `collapsible-N` (`open` |
 * `closed`; any other value degrades to a plain section rather than
 * throwing, since CMS input is untrusted) and `contents-label-N` are both
 * optional opt-ins: a page with neither renders exactly as it always has.
 */
interface Section {
	readonly index: number;
	readonly id: string;
	readonly heading?: string;
	readonly body?: string;
	readonly linkText?: string;
	readonly linkUrl?: string;
	readonly tip?: string;
	readonly collapse?: SectionCollapse;
	readonly contentsLabel?: string;
}

// Index-based, not derived from the heading text, so copy edits can never
// break bookmarks or inbound redirects.
const buildSectionId = (index: number): string => `page-section-${index}`;

const parseCollapse = (
	value: string | undefined,
): SectionCollapse | undefined => {
	if (value === "open" || value === "closed") return value;
	return undefined;
};

const parseSection = (page: PageItem, index: number): Section | undefined => {
	const heading = page[`heading-${index}`];
	const body = page[`main-text-${index}`];
	const linkText = page[`link-text-${index}`];
	const linkUrl = page[`link-url-${index}`];
	const tip = page[`tip-${index}`];

	if (!heading && !body && !(linkText && linkUrl) && !tip) return undefined;

	return {
		index,
		id: buildSectionId(index),
		heading,
		body,
		linkText,
		linkUrl,
		tip,
		collapse: parseCollapse(page[`collapsible-${index}`]),
		contentsLabel: page[`contents-label-${index}`],
	};
};

const parseSections = (page: PageItem): Section[] => {
	const sections: Section[] = [];

	for (let index = 1; index <= MAX_PAGE_SECTION_INDEX; index++) {
		const section = parseSection(page, index);
		if (section) sections.push(section);
	}

	return sections;
};

const hasContentsLabel = (
	section: Section,
): section is Section & { contentsLabel: string } =>
	Boolean(section.contentsLabel);

const buildContentsEntries = (
	sections: readonly Section[],
): PageContentsNavEntry[] =>
	sections.filter(hasContentsLabel).map((section) => ({
		label: section.contentsLabel,
		href: `#${section.id}`,
	}));

interface RenderSectionParams {
	readonly section: Section;
}

const renderSectionContent = ({ section }: RenderSectionParams): ReactNode => (
	<>
		{section.tip && (
			<div className="usa-alert usa-alert--info usa-alert--slim" role="alert">
				<div className="usa-alert__body">
					<p className="usa-alert__text">{section.tip}</p>
				</div>
			</div>
		)}
		{section.body && <PageProse body={section.body} />}
		{section.linkText && section.linkUrl && (
			<PageSectionLinkButton text={section.linkText} url={section.linkUrl} />
		)}
	</>
);

// A trailing <hr> divides every section from the next regardless of type, so
// a collapsible section is visually separated from what follows just like a
// plain one.
const renderSection = ({ section }: RenderSectionParams): ReactNode => {
	const body =
		section.collapse && section.heading ? (
			<CollapsibleSection
				defaultOpen={section.collapse === "open"}
				heading={section.heading}
				sectionId={section.id}
			>
				{renderSectionContent({ section })}
			</CollapsibleSection>
		) : (
			<section id={section.id}>
				{section.heading && <h2>{section.heading}</h2>}
				{renderSectionContent({ section })}
			</section>
		);

	return (
		<Fragment key={section.index}>
			{body}
			<hr className="margin-y-2" />
		</Fragment>
	);
};

const PageContent = ({ page, locale }: Props) => {
	const { learn: messages } = getApplicationMessages({ locale });
	const sections = parseSections(page);
	const contentsEntries = buildContentsEntries(sections);
	// Only pages that author at least one contents-label-N opt into the
	// two-column Contents rail layout; every other page keeps its original,
	// single-column shape.
	const hasContentsNav = contentsEntries.length > 0;

	const article = (
		<article className={hasContentsNav ? "page-content__body" : "page-content"}>
			<h1>{page.name}</h1>
			{page["sub-heading-text"] && (
				<p className="usa-intro">{page["sub-heading-text"]}</p>
			)}
			{sections.map((section) => renderSection({ section }))}
		</article>
	);

	if (!hasContentsNav) return article;

	return (
		<div className="usa-in-page-nav-container page-content layout-wide">
			{article}
			<PageContentsNav
				entries={contentsEntries}
				heading={messages.pageContentsHeading}
			/>
		</div>
	);
};

export default PageContent;
