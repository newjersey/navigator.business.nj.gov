import { getNonEssentialQuestionAnytimeActions } from "@/lib/domain-logic/getNonEssentialQuestionAnytimeActions";

jest.mock("../../../../content/src/roadmaps/nonEssentialQuestions.json", () => ({
  nonEssentialQuestionsArray: [
    {
      id: "test-non-essential",
      questionText: "Test Question?",
      anytimeActions: ["Action 1", "Action 2"],
    },
    {
      id: "test-non-essential-1",
      questionText: "Test Question?",
    },
    {
      id: "test-non-essential-2",
      questionText: "Test Question?",
      anytimeActions: [],
    },
  ],
}));

describe("getNonEssentialQuestionAnytimeActions", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns the associated Anytime Actions if essential question exists", () => {
    expect(getNonEssentialQuestionAnytimeActions("test-non-essential")).toEqual([
      "Action 1",
      "Action 2",
    ]);
  });

  it("returns an empty array if question does not contain Anytime Actions", () => {
    expect(getNonEssentialQuestionAnytimeActions("test-non-essential-1")).toEqual([]);

    expect(getNonEssentialQuestionAnytimeActions("test-non-essential-2")).toEqual([]);
  });

  it("returns an empty array if question doesn't exist", () => {
    expect(getNonEssentialQuestionAnytimeActions("does-not-exist")).toEqual([]);
  });
});
