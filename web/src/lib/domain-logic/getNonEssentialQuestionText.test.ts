import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";

vi.mock("@businessnjgovnavigator/content/roadmaps/nonEssentialQuestions.json", () => ({
  default: {
    nonEssentialQuestionsArray: [{ id: "test-non-essential", questionText: "Test Question?" }],
  },
}));

describe("getNonEssentialQuestionText", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns the question text if essential question exists", () => {
    expect(getNonEssentialQuestionText("test-non-essential")).toEqual("Test Question?");
  });

  it("returns undefined if essential question doesn't exist", () => {
    expect(getNonEssentialQuestionText("test-non-essential1")).toEqual(undefined);
  });
});
