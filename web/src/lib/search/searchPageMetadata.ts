import { findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { PageMetadata } from "@/lib/types/types";

export const searchPageMetadata = (pageMetadata: PageMetadata[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const metadata of pageMetadata) {
    let match: Match = {
      filename: metadata.filename,
      snippets: [],
    };

    const titlePrefix = metadata.titlePrefix.toLowerCase();
    const siteDescription = metadata.siteDescription.toLowerCase();
    const homeTitle = metadata.homeTitle.toLowerCase();
    const dashboardTitle = metadata.dashboardTitle.toLowerCase();
    const profileTitle = metadata.profileTitle.toLowerCase();

    const labelledTexts = [
      { content: titlePrefix, label: "Title Prefix" },
      { content: siteDescription, label: "Site Description" },
      { content: homeTitle, label: "Home Page Title" },
      { content: dashboardTitle, label: "Dashboard Page Title" },
      { content: profileTitle, label: "Profile Page Title" },
    ];

    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
