export type FullNameErrorVariant =
  | "NO_ERROR"
  | "MISSING"
  | "TOO_LONG"
  | "MUST_START_WITH_LETTER"
  | "CONTAINS_ILLEGAL_CHAR";

export const getFullNameErrorVariant = (name: string | undefined): FullNameErrorVariant => {
  if (!name || name.length === 0) {
    return "MISSING";
  }
  if (name.length > 50) {
    return "TOO_LONG";
  }
  const startsWithLetterRegex = /^[A-Za-z]/;
  if (!startsWithLetterRegex.test(name)) {
    return "MUST_START_WITH_LETTER";
  }
  const allowedCharactersRegex = /^[\w ',.-]*$/;
  if (!allowedCharactersRegex.test(name)) {
    return "CONTAINS_ILLEGAL_CHAR";
  }

  return "NO_ERROR";
};

export const isFullNameValid = (name: string | undefined): boolean => {
  return getFullNameErrorVariant(name) === "NO_ERROR";
};
