import { getNonEssentialQuestionAddOn } from "@/lib/domain-logic/getNonEssentialQuestionAddOn";

vi.mock("../../../../content/src/roadmaps/nonEssentialQuestions.json", () => ({
  nonEssentialQuestionsArray: [
    {
      id: "test-non-essential",
      questionText: "Test Question?",
      addOn: "testAddOn",
    },
  ],
}));

describe("getNonEssentialQuestionAddOn", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the question text if essential question exists", () => {
    expect(getNonEssentialQuestionAddOn("test-non-essential")).toEqual("testAddOn");
  });

  it("returns undefined if essential question doesn't exist", () => {
    expect(getNonEssentialQuestionAddOn("test-non-essential1")).toEqual(undefined);
  });
});
