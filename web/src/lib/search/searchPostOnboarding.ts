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

    const blockTexts = [content, radioNoContent];

    const labelledTexts = [
      { content: filename, label: "Filename" },
      { content: question, label: "question" },
    ];

    match = findMatchInBlock(blockTexts, term, match);
    match = findMatchInLabelledText(labelledTexts, term, match);

    if (match.snippets.length > 0) {
      matches.push(match);
    }
  }

  return matches;
};
