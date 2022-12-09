export const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const camelCaseToSentence = (text: string): string => {
  const spacedCase = text
    .split(/(?=[A-Z])/)
    .join(" ")
    .toLowerCase();
  return capitalizeFirstLetter(spacedCase);
};

export const kebabSnakeSentenceToCamelCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(/[\s_-]/gm)
    .map((cased, index) => {
      return index == 0 ? cased : capitalizeFirstLetter(cased);
    })
    .join("");
};

export const camelCaseToKebabCase = (text: string): string => {
  return text
    .split(/(?=[A-Z])/)
    .join("-")
    .toLowerCase();
};
