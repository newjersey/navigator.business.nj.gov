import { type AnchorHTMLAttributes, Fragment } from "react";
import Markdown, { type Components } from "react-markdown";
import type { PageItem } from "@/domain/content/types";

interface Props {
  readonly page: PageItem;
}

/**
 * Reserved Markdown link target that opens the Intercom messenger instead of
 * navigating. Content authors write `[Chat with us](#open-chat)`. No element
 * carries this id and `PageContent` adds no heading-slug plugin, so the
 * sentinel can never shadow a real in-page anchor.
 */
export const INTERCOM_LAUNCHER_HREF = "#open-chat";

/**
 * Renders the reserved Intercom sentinel link as a launcher button, or any
 * other Markdown link as a plain anchor. The `.intercomlaunch` class is the
 * selector `components/analytics/Intercom.tsx` binds the messenger to, and
 * `.text-link-button` makes the button read like the links around it. A
 * `button` is phrasing content, so it stays valid inside the `p` that
 * `Markdown` wraps prose in, and its text children supply its accessible name.
 */
const renderMarkdownAnchor = ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (href === INTERCOM_LAUNCHER_HREF) {
    return (
      <button className="text-link-button intercomlaunch" type="button">
        {children}
      </button>
    );
  }

  return <a href={href}>{children}</a>;
};

const markdownComponents: Components = { a: renderMarkdownAnchor };

interface Section {
  heading?: string;
  body?: string;
  linkText?: string;
  linkUrl?: string;
  tip?: string;
  index: number;
}

const PageContent = ({ page }: Props) => {
  const sections: Section[] = [];

  let n = 1;
  while (n <= 11) {
    const heading = page[`heading-${n}`];
    const body = page[`main-text-${n}`];
    const linkText = page[`link-text-${n}`];
    const linkUrl = page[`link-url-${n}`];
    const tip = page[`tip-${n}`];

    if (heading || body || (linkText && linkUrl) || tip)
      sections.push({
        heading: page[`heading-${n}`],
        body: page[`main-text-${n}`],
        linkText: page[`link-text-${n}`],
        linkUrl: page[`link-url-${n}`],
        tip: page[`tip-${n}`],
        index: n,
      });
    n++;
  }

  return (
    <article>
      <h1>{page.name}</h1>
      {page["sub-heading-text"] && <p className="usa-intro">{page["sub-heading-text"]}</p>}
      {sections.map((section) => (
        <Fragment key={section.index}>
          <hr className="margin-y-4" />
          <section>
            {section.heading && <h2>{section.heading}</h2>}
            {section.tip && (
              <div className="usa-alert usa-alert--info usa-alert--slim" role="alert">
                <div className="usa-alert__body">
                  <p className="usa-alert__text">{section.tip}</p>
                </div>
              </div>
            )}
            {section.body && (
              <div className="usa-prose">
                <Markdown components={markdownComponents}>{section.body}</Markdown>
              </div>
            )}
            {section.linkText && section.linkUrl && (
              <a href={section.linkUrl} className="usa-button">
                {section.linkText}
                {section.linkUrl.startsWith("http") && (
                  <svg className="usa-icon" aria-hidden="true" focusable="false">
                    <use href="/assets/njwds/dist/img/sprite.svg#launch" />
                  </svg>
                )}
              </a>
            )}
          </section>
        </Fragment>
      ))}
    </article>
  );
};

export default PageContent;
