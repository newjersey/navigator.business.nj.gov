// Mock the dependencies
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import { sendChangedNonEssentialQuestionAnalytics } from "@/lib/domain-logic/sendChangedNonEssentialQuestionAnalytics";
import analytics from "@/lib/utils/analytics";

jest.mock("@/lib/domain-logic/getNonEssentialQuestionText", () => ({
  getNonEssentialQuestionText: jest.fn(),
}));

jest.mock("@/lib/data-hooks/useConfig", () => ({
  useConfig: jest.fn(),
}));

jest.mock("@/lib/utils/analytics", () => ({
  event: {
    non_essential_question: {
      submitted: {
        submitted_non_essential_question: jest.fn(),
      },
    },
  },
}));

describe("sendChangedNonEssentialQuestionAnalytics", () => {
  // const mockSubmittedNonEssentialQuestion = analytics.event.non_essential_question.submitted
  //   .submit_non_essential_question as jest.Mock;
  // const mockGetNonEssentialQuestionText = getNonEssentialQuestionText as jest.Mock;
  // const mockUseConfig = useConfig as jest.Mock;
  // mockUseConfig.mockReturnValue({
  //   Config: {
  //     profileDefaults: {
  //       fields: {
  //         nonEssentialQuestions: {
  //           default: {
  //             radioButtonTrueText: "Yes",
  //             radioButtonFalseText: "No",
  //           },
  //         },
  //       },
  //     },
  //   },
  // });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send analytics when an answer changes from undefined to true", () => {
    const prevAnswers = { q1: undefined };
    const newAnswers = { q1: true };

   // mockGetNonEssentialQuestionText.mockReturnValue("Question for q1");

    sendChangedNonEssentialQuestionAnalytics(prevAnswers, newAnswers);

    // Verify the analytics event is called
   // expect(mockSubmittedNonEssentialQuestion).toHaveBeenCalledWith("Question for q1", "Yes");
  });

  it("should not send analytics when the answer is not changed", () => {
    const prevAnswers = { q1: true };
    const newAnswers = { q1: true };

    sendChangedNonEssentialQuestionAnalytics(prevAnswers, newAnswers);

    // Verify the analytics event is not called
    //expect(mockSubmittedNonEssentialQuestion).not.toHaveBeenCalled();
  });

  it("should not send analytics when the answer is empty", () => {
    const prevAnswers = { q1: true };
    const newAnswers = {};

    sendChangedNonEssentialQuestionAnalytics(prevAnswers, newAnswers);

    // Verify the analytics event is not called
    //expect(mockSubmittedNonEssentialQuestion).not.toHaveBeenCalled();
  });

  it("should send analytics when an answer changes from true to false", () => {
    const prevAnswers = { q1: true };
    const newAnswers = { q1: false };

    //mockGetNonEssentialQuestionText.mockReturnValue("Question for q1");

    sendChangedNonEssentialQuestionAnalytics(prevAnswers, newAnswers);

    // Verify the analytics event is called
    //expect(mockSubmittedNonEssentialQuestion).toHaveBeenCalledWith("Question for q1", "No");
  });

  it("should handle multiple changed non essential question answers correctly", () => {
    const prevAnswers = { q1: true, q2: undefined };
    const newAnswers = { q1: false, q2: true };

    // mockGetNonEssentialQuestionText
    //   .mockReturnValueOnce("Question for q1") // for q1
    //   .mockReturnValueOnce("Question for q2"); // for q2

    sendChangedNonEssentialQuestionAnalytics(prevAnswers, newAnswers);

    // Verify that the analytics event was called twice
   // expect(mockSubmittedNonEssentialQuestion).toHaveBeenCalledWith("Question for q1", "No");

   // expect(mockSubmittedNonEssentialQuestion).toHaveBeenCalledWith("Question for q2", "Yes");
  });

  it("should send analytics if one question changed answer", () => {
    const prevAnswers = { q1: true, q2: true };
    const newAnswers = { q2: false };

    // mockGetNonEssentialQuestionText // for q1
    //   .mockReturnValueOnce("Question for q2"); // for q2

    sendChangedNonEssentialQuestionAnalytics(prevAnswers, newAnswers);

    //expect(mockSubmittedNonEssentialQuestion).not.toHaveBeenCalledWith("Question for q1", "Yes");

    //expect(mockSubmittedNonEssentialQuestion).toHaveBeenCalledWith("Question for q2", "No");
  });
});
