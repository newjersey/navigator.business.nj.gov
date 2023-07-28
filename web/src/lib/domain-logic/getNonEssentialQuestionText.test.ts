import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";

jest.mock("../../../../content/src/roadmaps/nonEssentialQuestions.json", () => ({
  nonEssentialQuestionsArray: [
    {
      name: "test-non-essential",
      questionText: "Test Question?",
    },
  ],
}));

describe("getNonEssentialQuestionText", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns the question text if essential question exists", () => {
    expect(getNonEssentialQuestionText("test-non-essential")).toEqual("Test Question?");
  });

  it("returns undefined essential question doesn't exist", () => {
    expect(getNonEssentialQuestionText("test-non-essential1")).toEqual(undefined);
  });
});
