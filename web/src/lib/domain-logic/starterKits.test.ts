import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { createStarterKitProfileData } from "@/lib/domain-logic/starterKits";
import { emptyProfileData, getIndustries, type ProfileData } from "@businessnjgovnavigator/shared";

describe("starter Kits", () => {
  const combineObjectsKeepingTruthyValues = (obj1: ProfileData, obj2: ProfileData): ProfileData => {
    let result: ProfileData = { ...obj1 };
    for (const key in obj2) {
      const typedKey = key as keyof ProfileData;
      if (!result[typedKey]) {
        result = {
          ...result,
          [typedKey]: obj2[typedKey],
        };
      }
    }
    return result;
  };

  const removeFalsyValues = (obj: ProfileData): Partial<ProfileData> => {
    let result: Partial<ProfileData> = {};
    for (const key in obj) {
      const typedKey = key as keyof ProfileData;
      if (Object.prototype.hasOwnProperty.call(obj, typedKey) && obj[typedKey]) {
        result = {
          ...result,
          [typedKey]: obj[typedKey],
        };
      }
    }
    return result;
  };

  const createCombinedObjectWithAllEssentialQuestions = (): string[] => {
    let allStarterKitEssentialQuestions = emptyProfileData;

    for (const industry of getIndustries()) {
      const data = createStarterKitProfileData(industry);
      allStarterKitEssentialQuestions = combineObjectsKeepingTruthyValues(
        allStarterKitEssentialQuestions,
        data
      );
    }

    return Object.keys(removeFalsyValues(allStarterKitEssentialQuestions));
  };

  it("fails if a new essential question is added to the code base without being explicitly handled in starter kits", () => {
    const onlyStarterKitEssentialQuestions = createCombinedObjectWithAllEssentialQuestions();

    const mainAppEssentialQuestions = EssentialQuestions.map((question) => question.fieldName);

    for (const mainAppEssentialQuestion of mainAppEssentialQuestions) {
      const essentialQuestionInBoth = onlyStarterKitEssentialQuestions.includes(mainAppEssentialQuestion);
      if (!essentialQuestionInBoth) {
        console.error(
          "The new essential question should have a value set in createStarterKitProfileData() function",
          mainAppEssentialQuestion
        );
      }
      expect(essentialQuestionInBoth).toBe(true);
    }
  });
});
