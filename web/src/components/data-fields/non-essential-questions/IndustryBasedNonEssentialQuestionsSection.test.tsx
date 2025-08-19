import { IndustryBasedNonEssentialQuestionsSection } from "@/components/data-fields/non-essential-questions/IndustryBasedNonEssentialQuestionsSection";
import * as GetNonEssentialQuestionTextModule from "@/lib/domain-logic/getNonEssentialQuestionText";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { ProfileData } from "@businessnjgovnavigator/shared";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";
import { useMockIntersectionObserver } from "@/test/mock/MockIntersectionObserver";

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
      id: "test-industry-with-duplicate-questions",
      name: "test-industry-with-duplicate-questions",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: ["test-question-4"],
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

const mockArrayOfSectors = [
  {
    id: "test-sector-with-non-essential-questions",
    name: "test-sector-with-non-essential-questions",
    nonEssentialQuestionsIds: ["test-question-3"],
  },
  {
    id: "test-sector-with-duplicate.-questions",
    name: "test-sector-with-duplicate-questions",
    nonEssentialQuestionsIds: ["test-question-4"],
  },
  {
    id: "test-sector-with-no-non-essential-questions",
    name: "test-sector-with-no-non-essential-questions",
    nonEssentialQuestionsIds: [],
  },
];

jest.mock("@businessnjgovnavigator/shared/sector", () => ({
  ...jest.requireActual("@businessnjgovnavigator/shared/sector"),
  LookupSectorTypeById: jest.fn((id) => {
    return (
      mockArrayOfSectors.find((sector) => {
        return sector.id === id;
      }) ?? {
        id: "",
        name: "",
        nonEssentialQuestionsIds: [],
      }
    );
  }),
}));

const mockGetNonEssentialQuestionText = (
  GetNonEssentialQuestionTextModule as jest.Mocked<typeof GetNonEssentialQuestionTextModule>
).getNonEssentialQuestionText;

describe("ProfileNonEssentialQuestionsSection", () => {
  useMockIntersectionObserver();
  const renderComponent = (profileData: Partial<ProfileData>): void => {
    render(
      <WithStatefulProfileData
        initialData={generateProfileData({
          ...profileData,
        })}
      >
        <IndustryBasedNonEssentialQuestionsSection />
      </WithStatefulProfileData>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("doesn't display section if industry doesn't have any non essential questions", () => {
    renderComponent({
      industryId: "test-industry-with-no-non-essential-questions",
      businessPersona: "FOREIGN",
    });
    expect(screen.queryByTestId("non-essential-questions-wrapper")).not.toBeInTheDocument();
  });

  it("displays all the non essential questions if industry has non essential questions and persona is not OWNING", () => {
    mockGetNonEssentialQuestionText
      .mockReturnValueOnce("Non Essential Question 1?")
      .mockReturnValueOnce("Non Essential Question 2?")
      .mockReturnValueOnce("Non Essential Question 3?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
      sectorId: "test-sector-with-non-essential-questions",
      businessPersona: "STARTING",
    });

    expect(screen.getAllByTestId("non-essential-questions-wrapper").length).toBeGreaterThan(0);
    expect(screen.getByText("Non Essential Question 1?")).toBeInTheDocument();
    expect(screen.getByText("Non Essential Question 2?")).toBeInTheDocument();
    expect(screen.getByText("Non Essential Question 3?")).toBeInTheDocument();
  });

  it("displays a non essential question once if it is contained in both the industry and sector and person is not OWNING", () => {
    mockGetNonEssentialQuestionText.mockReturnValueOnce("Non Essential Question 4?");

    renderComponent({
      industryId: "test-industry-with-duplicate-questions",
      sectorId: "test-sector-with-duplicate-questions",
      businessPersona: "STARTING",
    });

    expect(screen.getAllByTestId("non-essential-questions-wrapper").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Non Essential Question 4?").length).toBe(1);
    expect(screen.getByText("Non Essential Question 4?")).toBeInTheDocument();
  });

  it("only displays sector non essential questions if sector has non essential questions and persona is OWNING", () => {
    mockGetNonEssentialQuestionText.mockReturnValueOnce("Non Essential Question 3?");

    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
      sectorId: "test-sector-with-non-essential-questions",
      businessPersona: "OWNING",
    });

    expect(screen.getAllByTestId("non-essential-questions-wrapper").length).toBeGreaterThan(0);
    expect(mockGetNonEssentialQuestionText).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Non Essential Question 3?")).toBeInTheDocument();
  });

  it("does not display section if sector doesn't have any non essential questions", () => {
    renderComponent({
      industryId: "test-industry-with-non-essential-questions",
      sectorId: "test-sector-with-no-non-essential-questions",
      businessPersona: "OWNING",
    });

    expect(screen.queryAllByTestId("non-essential-questions-wrapper").length).toBe(0);
    expect(mockGetNonEssentialQuestionText).toHaveBeenCalledTimes(0);
  });

  it("displays custom non essential questions specifically for Owning businesses", () => {
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
