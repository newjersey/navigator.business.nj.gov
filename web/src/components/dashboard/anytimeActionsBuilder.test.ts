import { getAnytimeActionsFromNonEssentialQuestions } from "@/components/dashboard/anytimeActionsBuilder";
import { generateAnytimeActionTask } from "@/test/factories";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";

const anytimeActionsTasks = [
  generateAnytimeActionTask({ filename: "anytime-action-1" }),
  generateAnytimeActionTask({ filename: "anytime-action-2" }),
  generateAnytimeActionTask({ filename: "anytime-action-3" }),
];

jest.mock("../../../../content/src/roadmaps/nonEssentialQuestions.json", () => ({
  nonEssentialQuestionsArray: [
    {
      id: "test-non-essential-question-1",
      questionText: "Test Question?",
      anytimeActions: ["anytime-action-2"],
    },
    {
      id: "test-non-essential-questio-2",
      questionText: "Test Question?",
      anytimeActions: ["anytime-action-3"],
    },
  ],
}));

describe("anytimeActionsBuilder", () => {
  describe("getAnytimeActionsFromNonEssentialQuestions", () => {
    it("should not return Anytime Actions if profileData is undefined", () => {
      const returnValue = getAnytimeActionsFromNonEssentialQuestions(
        undefined,
        anytimeActionsTasks,
      );
      expect(returnValue).toEqual([]);
    });

    it("should not return Anytime Actions if the user has not answered Non-Essential questions", () => {
      const profileData = generateProfileData({ nonEssentialRadioAnswers: {} });

      const returnValue = getAnytimeActionsFromNonEssentialQuestions(
        profileData,
        anytimeActionsTasks,
      );
      expect(returnValue).toEqual([]);
    });

    it("should return Anytime Actions corresponding to the answered Non-Essential questions", () => {
      const profileData = generateProfileData({
        nonEssentialRadioAnswers: {
          "test-non-essential-question-1": true,
          "test-non-essential-question-2": false,
        },
      });

      const returnValue = getAnytimeActionsFromNonEssentialQuestions(
        profileData,
        anytimeActionsTasks,
      );
      expect(returnValue).toEqual([anytimeActionsTasks[1]]);
    });
  });
});
