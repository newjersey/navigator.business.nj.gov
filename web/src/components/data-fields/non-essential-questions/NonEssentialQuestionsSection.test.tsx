import { NonEssentialQuestionsSection } from "@/components/data-fields/non-essential-questions/NonEssentialQuestionsSection";
import * as GetNonEssentialQuestionTextModule from "@/lib/domain-logic/getNonEssentialQuestionText";
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

const mockGetNonEssentialQuestionText = (
  GetNonEssentialQuestionTextModule as jest.Mocked<typeof GetNonEssentialQuestionTextModule>
).getNonEssentialQuestionText;

describe("ProfileNonEssentialQuestionsSection", () => {
  const renderComponent = (profileData: Partial<ProfileData>): void => {
    render(
      <WithStatefulProfileData
        initialData={generateProfileData({
          ...profileData,
        })}
      >
        <NonEssentialQuestionsSection />
      </WithStatefulProfileData>,
    );
  };

  it("doesn't display section if industry doesn't have any non essential questions", () => {
    renderComponent({
      industryId: "test-industry-with-no-non-essential-questions",
      businessPersona: "FOREIGN",
    });
    expect(screen.queryByTestId("non-essential-questions-wrapper")).not.toBeInTheDocument();
  });

  it("displays all the non essential questions if industry has non essential questions", () => {
    mockGetNonEssentialQuestionText
      .mockReturnValueOnce("Non Essential Question 1?")
      .mockReturnValueOnce("Non Essential Question 2?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
      businessPersona: "STARTING",
    });

    expect(screen.getAllByTestId("non-essential-questions-wrapper").length).toBeGreaterThan(0);
    expect(screen.getByText("Non Essential Question 1?")).toBeInTheDocument();
    expect(screen.getByText("Non Essential Question 2?")).toBeInTheDocument();
  });

  it("displays different values specifically for Owning businesses", () => {
    mockGetNonEssentialQuestionText
      .mockReturnValueOnce("Non Essential Question 1?")
      .mockReturnValueOnce("Non Essential Question 2?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
      businessPersona: "OWNING",
      sectorId: "arts-entertainment-and-recreation",
    });

    expect(screen.queryByText("Non Essential Question 1?")).not.toBeInTheDocument();
    expect(screen.getByTestId("carnivalRideOwningBusiness-radio-group")).toBeInTheDocument();
  });
});
