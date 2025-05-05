import { NonEssentialQuestion } from "@/components/data-fields/non-essential-questions/NonEssentialQuestion";
import { getMergedConfig } from "@/contexts/configContext";
import * as GetNonEssentialQuestionTextModule from "@/lib/domain-logic/getNonEssentialQuestionText";
import analytics from "@/lib/utils/analytics";
import { setNonEssentialQuestionViewedDimension } from "@/lib/utils/analytics-helpers";
import { useIntersectionOnElement } from "@/lib/utils/useIntersectionOnElement";
import { currentProfileData, WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { createEmptyProfileData, generateProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, within } from "@testing-library/react";

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

const questionText = "Cool Test Question?";
const Config = getMergedConfig();

describe("ProfileNonEssentialQuestion", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetNonEssentialQuestionText.mockReturnValue(questionText);
  });

  const renderEssentialQuestion = ({
    essentialQuestionId,
    profileData,
  }: {
    essentialQuestionId: string;
    profileData?: Partial<ProfileData>;
  }): void => {
    render(
      <WithStatefulProfileData
        initialData={generateProfileData({ ...profileData }) ?? createEmptyProfileData()}
      >
        <NonEssentialQuestion essentialQuestionId={essentialQuestionId} />
      </WithStatefulProfileData>
    );
  };

  it("renders both the question text and optional text suffix", () => {
    renderEssentialQuestion({ essentialQuestionId: "cool-test-id" });
    expect(screen.getByText(questionText)).toBeInTheDocument();
    expect(
      screen.getByText(Config.profileDefaults.fields.nonEssentialQuestions.default.optionalText)
    ).toBeInTheDocument();
  });

  it("doesn't have an option pre-filled if user hasn't selected anything", () => {
    renderEssentialQuestion({ essentialQuestionId: "cool-test-id" });
    expect(
      within(screen.getByTestId("cool-test-id-radio-no") as HTMLInputElement).getByRole("radio")
    ).not.toBeChecked();
    expect(
      within(screen.getByTestId("cool-test-id-radio-yes") as HTMLInputElement).getByRole("radio")
    ).not.toBeChecked();
  });

  it("updates profile data with true if answered yes", () => {
    renderEssentialQuestion({
      essentialQuestionId: "cool-test-id",
      profileData: { nonEssentialRadioAnswers: { "cool-test-id": false } },
    });
    fireEvent.click(screen.getByTestId("cool-test-id-radio-yes"));
    expect(currentProfileData().nonEssentialRadioAnswers).toEqual({ "cool-test-id": true });
  });

  it("updates profile data with false if answered no", () => {
    renderEssentialQuestion({
      essentialQuestionId: "cool-test-id",
      profileData: { nonEssentialRadioAnswers: { "cool-test-id": true } },
    });
    fireEvent.click(screen.getByTestId("cool-test-id-radio-no"));
    expect(currentProfileData().nonEssentialRadioAnswers).toEqual({ "cool-test-id": false });
  });

  describe("Non Essential Question Analytics", () => {
    it("should call nonEssentialQuestionViewedDimenension and analytics when in view", () => {
      (useIntersectionOnElement as jest.Mock).mockReturnValue(true);
      renderEssentialQuestion({
        essentialQuestionId: "cool-test-id",
        profileData: { nonEssentialRadioAnswers: { "cool-test-id": false } },
      });

      expect(setNonEssentialQuestionViewedDimension).toHaveBeenCalledWith("Cool Test Question?");

      expect(analytics.dimensions.update).toHaveBeenCalled();
    });

    it("should not call setNonEssentialQuestionViewedDimension and analytics when not in view", () => {
      (useIntersectionOnElement as jest.Mock).mockReturnValue(false);
      renderEssentialQuestion({
        essentialQuestionId: "cool-test-id",
        profileData: { nonEssentialRadioAnswers: { "cool-test-id": false } },
      });

      expect(setNonEssentialQuestionViewedDimension).not.toHaveBeenCalled();

      expect(analytics.dimensions.update).not.toHaveBeenCalled();
    });

    it("should not call setNonEssentialQuestionViewedDimension and analytics when in view and no question text", () => {
      (useIntersectionOnElement as jest.Mock).mockReturnValue(false);
      mockGetNonEssentialQuestionText.mockReturnValue("");
      renderEssentialQuestion({
        essentialQuestionId: "cool-test-id",
        profileData: { nonEssentialRadioAnswers: { "cool-test-id": false } },
      });

      expect(setNonEssentialQuestionViewedDimension).not.toHaveBeenCalled();

      expect(analytics.dimensions.update).not.toHaveBeenCalled();
    });
  });
});
