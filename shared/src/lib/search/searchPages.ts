import { PageItem } from "../../types";
import { convertFileDataToMatchList } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchPages = (pages: PageItem[], term: string): Match[] => {
  const pageData = getPageData(pages);

  return convertFileDataToMatchList(pageData, term);
};

export const getPageData = (pages: PageItem[]): FileData[] => {
  const pageData: FileData[] = [];

  for (const page of pages) {
    const name = page.name.toLowerCase();
    const slug = page.slug.toLowerCase();
    const subHeadingText = page["sub-heading-text"]?.toLowerCase();
    const teaserText = page["teaser-text"]?.toLowerCase();
    const mainLinkText = page["main-link-text"]?.toLowerCase();
    const metaData = page["meta-data"]?.toLowerCase();
    const webflowId = page.webflowId?.toLowerCase();

    // Collect all headings and main text
    const blockTexts: string[] = [];
    const labelledTexts: Array<{ content: string | undefined; label: string }> = [
      { content: name, label: "Name" },
      { content: slug, label: "Slug" },
      { content: subHeadingText, label: "Sub-Heading" },
      { content: mainLinkText, label: "Main Link Text" },
      { content: webflowId, label: "Webflow ID" },
    ];

    if (teaserText) {
      blockTexts.push(teaserText);
    }

    if (metaData) {
      blockTexts.push(metaData);
    }

    // Add all headings and main-text content
    for (let index = 1; index <= 11; index++) {
      const heading = page[`heading-${index}` as keyof PageItem] as string | undefined;
      const mainText = page[`main-text-${index}` as keyof PageItem] as string | undefined;

      if (heading) {
        labelledTexts.push({ content: heading.toLowerCase(), label: `Heading ${index}` });
      }

      if (mainText) {
        blockTexts.push(mainText.toLowerCase());
      }
    }

    pageData.push({
      fileName: page.slug,
      labelledTexts,
      blockTexts,
      listTexts: [],
    });
  }

  return pageData;
};
