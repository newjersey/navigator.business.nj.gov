import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import type { ProfileContentField } from "@businessnjgovnavigator/shared/types";
import { NonEssentialQuestionForPersonas } from "@/components/data-fields/non-essential-questions/nonEssentialQuestionsHelpers";
import analytics from "@/lib/utils/analytics";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { renderWithUserData } from "@/test/render/renderWithUserData";

const renderNonEssentialQuestionsHelpers = (questionId: ProfileContentField): void => {
  const initialProfileData = generateProfileData({});
  renderWithUserData(
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
