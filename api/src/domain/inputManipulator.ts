/* eslint-disable @typescript-eslint/no-explicit-any */

export const inputManipulator = (initial: string): any => ({
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
