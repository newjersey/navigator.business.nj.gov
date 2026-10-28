export const convertTextToMarkdownBold = (text: string): string => {
  if (!text) return "";

  // Without trimming, leading/trailing spaces cause underscores to literally be displayed
  const trimmedText = text.trim();

  return `__${trimmedText}__`;
};

export const removeContextualInfoFormatting = (sentence: string): string => {
  return sentence.replaceAll(/`([^`|]+)\|[^`]+`/g, (_match, firstText) => {
    return firstText.trim();
  });
};
