import { LabelledContent, LabelledContentList, Match } from "@/lib/search/typesForSearch";

const removeMarkdownStyling = (markdownInput: string | undefined): string | undefined => {
  if (markdownInput === undefined) {
    return undefined;
  }
  const nonMarkdownString = markdownInput
    .replaceAll(/(\*\*|__)(.*?)\1/g, "$2")
    .replaceAll(/(\*|_)(.*?)\1/g, "$2");
  return nonMarkdownString;
};

export const findMatchInBlock = (
  blockTexts: (string | undefined)[],
  term: string,
  match: Match,
): Match => {
  for (const blockText of blockTexts) {
    const blockTextProcessed = removeMarkdownStyling(blockText);
    if (blockTextProcessed?.includes(term)) {
      match.snippets.push(makeSnippet(blockTextProcessed, term));
    }
  }
  return match;
};

export const makeSnippet = (text: string, term: string): string => {
  const index = text.toLowerCase().indexOf(term.toLowerCase());
  const startIndex = index - 50 < 0 ? 0 : index - 50;
  const endIndex = term.length + index + 50;
  return text.slice(startIndex, endIndex);
};

export const findMatchInLabelledText = (
  labelledTexts: LabelledContent[],
  term: string,
  match: Match,
): Match => {
  for (const labelledText of labelledTexts) {
    const labelTextProcessed = removeMarkdownStyling(labelledText.content);
    if (labelTextProcessed?.includes(term)) {
      match.snippets.push(`${labelledText.label}: ${labelTextProcessed}`);
    }
  }
  return match;
};

export const findMatchInListText = (
  listTexts: LabelledContentList[],
  term: string,
  match: Match,
): Match => {
  for (const listText of listTexts) {
    for (const item of listText.content) {
      const itemProcessed = removeMarkdownStyling(item);
      if (itemProcessed?.includes(term)) {
        match.snippets.push(`${listText.label}: ${itemProcessed}`);
      }
    }
  }
  return match;
};
