/* eslint-disable @typescript-eslint/no-explicit-any */

type InputManipulator = {
  value: string;
  stripPunctuation: () => InputManipulator;
  trimPunctuation: () => InputManipulator;
  stripWhitespace: () => InputManipulator;
  removeArticles: () => InputManipulator;
  removeBusinessDesignators: () => InputManipulator;
  makeLowerCase: () => InputManipulator;
};

export const inputManipulator = (initial: string): InputManipulator => {
  return {
    value: initial,
    stripPunctuation: function (): InputManipulator {
      this.value = this.value.replace(/[!"#$%()*+,./:;<=>?@^_`{}~-]/g, "");
      return this;
    },
    trimPunctuation: function (): InputManipulator {
      const startsOrEndsWithPunctuation = /^[\s!"#$%()*+,.:;<=-_`{}~]+|[\s!"#$%()*+,.:;<=-_`{}~]+$/g;
      this.value = this.value.replace(startsOrEndsWithPunctuation, "");
      return this;
    },
    stripWhitespace: function (): InputManipulator {
      this.value = this.value.replace(/\s+/g, "");
      return this;
    },
    removeArticles: function (): InputManipulator {
      this.value = removeWords(this.value, ["a", "an", "the"]);
      return this;
    },
    removeBusinessDesignators: function (): InputManipulator {
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
        "of new jersey"
      ]);
      return this;
    },
    makeLowerCase: function (): InputManipulator {
      this.value = this.value.toLowerCase();
      return this;
    }
  };
};

const removeWords = (value: string, words: string[]): string => {
  const regexString = words.join("|");
  return value.replace(new RegExp(`\\b(${regexString})\\b`, "gi"), " ").replace(/\s{2,}/g, " ");
};
