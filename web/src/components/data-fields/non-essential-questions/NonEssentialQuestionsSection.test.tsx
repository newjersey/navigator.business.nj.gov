import { NonEssentialQuestionsSection } from "@/components/data-fields/non-essential-questions/NonEssentialQuestionsSection";
import { getMergedConfig } from "@/contexts/configContext";
import * as GetNonEssentialQuestionTextModule from "@/lib/domain-logic/getNonEssentialQuestionText";
import analytics from "@/lib/utils/analytics";
import * as analyticsHelpers from "@/lib/utils/analytics-helpers";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import { useMockIntersectionObserver } from "@/test/mock/mockIntersectionObserver";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { ProfileData } from "@businessnjgovnavigator/shared";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

jest.mock("../../../../../shared/lib/content/lib/industry.json", () => ({
  industries: [
    ...jest.requireActual("../../../../../shared/lib/content/lib/industry.json").industries,
    {
      id: "test-industry-with-non-essential-questions",
      name: "test-industry-with-non-essential-questions",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: ["test-question-1", "test-question-2"],
      naicsCodes: "",
      isEnabled: true,
      industryOnboardingQuestions: {},
    },
    {
      id: "test-industry-with-no-non-essential-questions",
      name: "test-industry-with-no-non-essential-questions",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: [],
      naicsCodes: "",
      isEnabled: true,
      industryOnboardingQuestions: {},
    },
  ],
}));

jest.mock("@/lib/domain-logic/getNonEssentialQuestionText", () => ({
  getNonEssentialQuestionText: jest.fn(),
}));

jest.mock("@/lib/utils/useIntersectionOnElement");

jest.mock("@/lib/utils/analytics", () => ({
  dimensions: {
    update: jest.fn(),
  },
}));

jest.mock("@/lib/utils/analytics-helpers", () => ({
  setNonEssentialQuestionViewedDimension: jest.fn(),
}));

const mockGetNonEssentialQuestionText = (
  GetNonEssentialQuestionTextModule as jest.Mocked<typeof GetNonEssentialQuestionTextModule>
).getNonEssentialQuestionText;

describe("ProfileNonEssentialQuestionsSection", () => {
  const Config = getMergedConfig();

  beforeEach(() => {
    jest.resetAllMocks();
    useMockIntersectionObserver();
  });

  const renderComponent = (profileData: Partial<ProfileData>): void => {
    render(
      <WithStatefulProfileData
        initialData={generateProfileData({
          ...profileData,
        })}
      >
        <NonEssentialQuestionsSection />
      </WithStatefulProfileData>
    );
  };

  it("doesn't display section if industry doesn't have any non essential questions", () => {
    renderComponent({ industryId: "test-industry-with-no-non-essential-questions" });
    expect(
      screen.queryByText(Config.profileDefaults.fields.nonEssentialQuestions.default.header)
    ).not.toBeInTheDocument();
  });

  it("displays all the non essential questions if industry has non essential questions", () => {
    mockGetNonEssentialQuestionText
      .mockReturnValueOnce("Non Essential Question 1?")
      .mockReturnValueOnce("Non Essential Question 2?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
    });

    expect(
      screen.getByText(Config.profileDefaults.fields.nonEssentialQuestions.default.header)
    ).toBeInTheDocument();
    expect(screen.getByText("Non Essential Question 1?")).toBeInTheDocument();
    expect(screen.getByText("Non Essential Question 2?")).toBeInTheDocument();
  });

  it("displays all the non essential questions if industry has non essential questions and when in view to call set dimensions and set analytics twice", () => {
    (useIntersectionOnElement as jest.Mock).mockReturnValue(true);

    mockGetNonEssentialQuestionText
      .mockReturnValueOnce("Non Essential Question 1?")
      .mockReturnValueOnce("Non Essential Question 2?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
    });

    expect(analyticsHelpers.setNonEssentialQuestionViewedDimension).toHaveBeenCalledTimes(2);
    expect(analytics.dimensions.update).toHaveBeenCalledTimes(2);
  });

  it("when not in view to not call set dimensions and set analytics", () => {
    (useIntersectionOnElement as jest.Mock).mockReturnValue(false);

    mockGetNonEssentialQuestionText
      .mockReturnValueOnce("Non Essential Question 1?")
      .mockReturnValueOnce("Non Essential Question 2?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
    });

    expect(analyticsHelpers.setNonEssentialQuestionViewedDimension).toHaveBeenCalledTimes(0);
    expect(analytics.dimensions.update).toHaveBeenCalledTimes(0);
  });
});
