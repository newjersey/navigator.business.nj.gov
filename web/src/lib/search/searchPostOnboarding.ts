import { findMatchInBlock, findMatchInLabelledText } from "@/lib/search/helpers";
import { Match } from "@/lib/search/typesForSearch";
import { PostOnboardingFile } from "@/lib/types/types";

export const searchPostOnboarding = (postOnboardings: PostOnboardingFile[], term: string): Match[] => {
  const matches: Match[] = [];

  for (const item of postOnboardings) {
    let match: Match = {
      filename: item.filename,
      snippets: [],
    };

    const content = item.contentMd.toLowerCase();
    const filename = item.filename.toLowerCase();
    const question = item.question.toLowerCase();
    const radioNoContent = item.radioNoContent.toLowerCase();

    const ctaYesText1 = item.callToActionYesText1?.toLowerCase();
    const ctaYesLink1 = item.callToActionYesLink1?.toLowerCase();
    const ctaYesText2 = item.callToActionYesText2?.toLowerCase();
    const ctaYesLink2 = item.callToActionYesLink2?.toLowerCase();
    const ctaYesDropdownText = item.callToActionYesDropdownText?.toLowerCase();

    const blockTexts = [content, radioNoContent];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: question, label: "question" },
      { content: ctaYesDropdownText, label: "CTA (Yes) Dropdown Name" },
      { content: ctaYesText1, label: "CTA (Yes) Link 1 Name" },
      { content: ctaYesLink1, label: "CTA (Yes) Link 1 Destination" },
      { content: ctaYesText2, label: "CTA (Yes) Link 2 Name" },
      { content: ctaYesLink2, label: "CTA (Yes) Link 2 Destination" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
