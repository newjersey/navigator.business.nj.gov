import { NonEssentialQuestionForPersonas } from "@/components/data-fields/non-essential-questions/nonEssentialQuestionsHelpers";
import { render } from "@testing-library/react";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { ProfileContentField } from "@businessnjgovnavigator/shared/types";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import analytics from "@/lib/utils/analytics";

const renderNonEssentialQuestionsHelpers = (questionId: ProfileContentField): void => {
  const initialProfileData = generateProfileData({});
  render(
    <WithStatefulProfileData initialData={initialProfileData}>
      <NonEssentialQuestionForPersonas questionId={questionId} />
    </WithStatefulProfileData>,
  );
};

jest.mock("@/lib/utils/useIntersectionOnElement", () => ({
  useIntersectionOnElement: jest.fn(),
}));

jest.mock("@/lib/utils/analytics", () => ({
  event: {
    non_essential_question_view: {
      view: {
        non_essential_question_view: jest.fn(),
      },
    },
  },
}));

describe("NonEssentialQuestionForPersonas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Analytics Tracking", () => {
    it("triggers analytics when element enters viewport for the first time", () => {
      (useIntersectionOnElement as jest.Mock).mockReturnValue(true);
      renderNonEssentialQuestionsHelpers("homeBasedBusiness");
      expect(
        analytics.event.non_essential_question_view.view.non_essential_question_view,
      ).toHaveBeenCalledWith("homeBasedBusiness");
    });

    it("does not trigger analytics when element does not enter viewport", () => {
      (useIntersectionOnElement as jest.Mock).mockReturnValue(false);
      renderNonEssentialQuestionsHelpers("homeBasedBusiness");
      expect(
        analytics.event.non_essential_question_view.view.non_essential_question_view,
      ).not.toHaveBeenCalledWith("homeBasedBusiness");
    });
  });
});
