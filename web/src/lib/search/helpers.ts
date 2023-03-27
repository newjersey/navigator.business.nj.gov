import { LabelledContent, LabelledContentList, Match } from "@/lib/search/typesForSearch";

export const findMatchInBlock = (blockTexts: string[], term: string, match: Match): Match => {
  for (const blockText of blockTexts) {
    if (blockText.includes(term)) {
      const index = blockText.indexOf(term);
      const startIndex = index - 50 < 0 ? 0 : index - 50;
      const endIndex = term.length + index + 50;
      match.snippets.push(blockText.slice(startIndex, endIndex));
    }
  }
  return match;
};

export const findMatchInLabelledText = (
  labelledTexts: LabelledContent[],
  term: string,
  match: Match
): Match => {
  for (const labelledText of labelledTexts) {
    if (labelledText.content?.includes(term)) {
      match.snippets.push(`${labelledText.label}: ${labelledText.content}`);
    }
  }
  return match;
};

export const findMatchInListText = (listTexts: LabelledContentList[], term: string, match: Match): Match => {
  for (const listText of listTexts) {
    for (const item of listText.content) {
      if (item?.includes(term)) {
        match.snippets.push(`${listText.label}: ${item}`);
      }
    }
  }
  return match;
};
