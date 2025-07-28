import {
  getNonEssentialQuestionAddOnWhenNo,
  getNonEssentialQuestionAddOnWhenYes,
} from "@/lib/domain-logic/getNonEssentialQuestionAddOn";

jest.mock("../../../../content/src/roadmaps/nonEssentialQuestions.json", () => ({
  nonEssentialQuestionsArray: [
    {
      id: "test-non-essential",
      questionText: "Test Question?",
      addOnWhenYes: "testAddOnWhenYes",
      addOnWhenNo: "testAddOnWhenNo",
    },
  ],
}));

describe("getNonEssentialQuestionAddOnWhenYes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns the addOnWhenYes id if essential question exists has it has an applicable one", () => {
    expect(getNonEssentialQuestionAddOnWhenYes("test-non-essential")).toEqual("testAddOnWhenYes");
  });

  it("returns undefined if essential question doesn't exist", () => {
    expect(getNonEssentialQuestionAddOnWhenYes("test-non-essential1")).toEqual(undefined);
  });
});

describe("getNonEssentialQuestionAddOnWhenNo", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns the addOnWhenNo id if essential question exists has it has an applicable one", () => {
    expect(getNonEssentialQuestionAddOnWhenNo("test-non-essential")).toEqual("testAddOnWhenNo");
  });

  it("returns undefined if essential question doesn't exist", () => {
    expect(getNonEssentialQuestionAddOnWhenNo("test-non-essential1")).toEqual(undefined);
  });
});
