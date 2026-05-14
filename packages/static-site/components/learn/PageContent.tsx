import Markdown from "react-markdown";
import type { PageItem } from "@/domain/content/types";

interface Props {
  readonly page: PageItem;
}

interface Section {
  heading?: string;
  body?: string;
  linkText?: string;
  linkUrl?: string;
  tip?: string;
}

const PageContent = ({ page }: Props) => {
  const sections: Section[] = [];

  let n = 1;
  while (
    page[`heading-${n}`] ||
    page[`main-text-${n}`] ||
    page[`link-text-${n}`] ||
    page[`tip-${n}`]
  ) {
    sections.push({
      heading: page[`heading-${n}`],
      body: page[`main-text-${n}`],
      linkText: page[`link-text-${n}`],
      linkUrl: page[`link-url-${n}`],
      tip: page[`tip-${n}`],
    });
    n++;
  }

  return (
    <article>
      <h1>{page.name}</h1>
      {page["sub-heading-text"] && <p className="usa-intro">{page["sub-heading-text"]}</p>}
      {sections.map((section) => (
        <>
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
            {section.body && <Markdown>{section.body}</Markdown>}
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
        </>
      ))}
    </article>
  );
};

export default PageContent;
