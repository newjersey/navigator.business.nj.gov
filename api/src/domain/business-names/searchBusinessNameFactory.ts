import { BusinessNameRepo, NameAvailability, SearchBusinessName } from "../types";

export const searchBusinessNameFactory = (businessNameRepo: BusinessNameRepo): SearchBusinessName => {
  return async (name: string): Promise<NameAvailability> => {
    const searchName = nameManipulator(name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .removeArticles()
      .trimPunctuation().value;

    if (!searchName) {
      return Promise.reject("BAD_INPUT");
    }

    const similarNames = await businessNameRepo.search(searchName);

    const adjustedName = cleanName(name);
    const adjustedSimilar = similarNames.map(cleanName);

    if (adjustedSimilar.includes(adjustedName)) {
      return {
        status: "UNAVAILABLE",
        similarNames: similarNames.slice(0, 10),
      };
    }

    return {
      status: "AVAILABLE",
      similarNames: [],
    };
  };
};

const cleanName = (value: string): string =>
  nameManipulator(value)
    .makeLowerCase()
    .stripPunctuation()
    .removeBusinessDesignators()
    .removeArticles()
    .stripWhitespace().value;

const nameManipulator = (initial: string) => ({
  value: initial,
  stripPunctuation: function () {
    this.value = this.value.replace(/[@?.",/#!$%^*;:{}+<>=\-_`~()]/g, "");
    return this;
  },
  trimPunctuation: function () {
    const startsOrEndsWithPunctuation = /^[\s@?.",#!$%^*;:{}+<>=-_`~()]+|[\s@?.",#!$%^*;:{}+<>=-_`~()]+$/g;
    this.value = this.value.replace(startsOrEndsWithPunctuation, "");
    return this;
  },
  stripWhitespace: function () {
    this.value = this.value.replace(/\s+/g, "");
    return this;
  },
  removeArticles: function () {
    this.value = removeWords(this.value, ["a", "an", "the"]);
    return this;
  },
  removeBusinessDesignators: function () {
    this.value = removeWords(this.value, [
      "a nj nonprofit corporation",
      "limited liability company",
      "inc ii",
      "inc",
      "llc",
      "incorporated",
      "corporation of new jersey",
      "corporation of",
      "corporation",
      "corp",
      "co",
      "a new jersey non profit corporation",
      "a limited dividend housing partnership",
      "of new jersey",
    ]);
    return this;
  },
  makeLowerCase: function () {
    this.value = this.value.toLowerCase();
    return this;
  },
});

const removeWords = (value: string, words: string[]): string => {
  const regexString = words.join("|");
  return value.replace(new RegExp("\\b(" + regexString + ")\\b", "gi"), " ").replace(/\s{2,}/g, " ");
};
