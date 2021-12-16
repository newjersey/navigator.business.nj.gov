import { inputManipulator } from "../inputManipulator";
import { BusinessNameClient, NameAvailability, SearchBusinessName } from "../types";

export const searchBusinessNameFactory = (businessNameClient: BusinessNameClient): SearchBusinessName => {
  return async (name: string): Promise<NameAvailability> => {
    const searchName = inputManipulator(name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .removeArticles()
      .trimPunctuation().value;

    if (!searchName) {
      return Promise.reject("BAD_INPUT");
    }

    const similarNames = await businessNameClient.search(searchName);

    const adjustedName = cleanBusinessName(name);
    const adjustedSimilar = similarNames.map(cleanBusinessName);

    if (adjustedSimilar.some((it) => it.includes(adjustedName))) {
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

export const cleanBusinessName = (value: string): string =>
  inputManipulator(value)
    .makeLowerCase()
    .stripPunctuation()
    .removeBusinessDesignators()
    .removeArticles()
    .stripWhitespace().value;
