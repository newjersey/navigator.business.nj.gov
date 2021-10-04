import { fireEvent, render } from "@testing-library/react";
import { OperateSection } from "@/components/roadmap/OperateSection";
import { useMockOnboardingData, useMockUserData } from "@/test/mock/mockUseUserData";
import {
  generateOnboardingData,
  generatePreferences,
  generateTaxFiling,
  generateUserData,
} from "@/test/factories";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import dayjs from "dayjs";
import { OperateDisplayContent } from "@/lib/types/types";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const emptyContent: OperateDisplayContent = {
  dateOfFormationMd: "",
  annualFilingMd: "",
};

describe("<OperateSection />", () => {
  beforeEach(() => {
    useMockUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["OPERATE"],
      }),
    });

    setupStatefulUserDataContext();
  });

  it("renders datepicker when dateOfFormation is undefined", () => {
    useMockOnboardingData({ dateOfFormation: undefined });
    const subject = render(<OperateSection displayContent={emptyContent} />);
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).not.toBeInTheDocument();
  });

  it("renders annual filing date when dateOfFormation is defined", () => {
    useMockOnboardingData({ dateOfFormation: "2020-01-01" });
    const subject = render(<OperateSection displayContent={emptyContent} />);
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).not.toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).toBeInTheDocument();
  });

  it("updates date of formation to the first day of the provided month and year", () => {
    const initialUserData = generateUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: undefined }),
    });
    const subject = render(
      <WithStatefulUserData initialUserData={initialUserData}>
        <OperateSection displayContent={emptyContent} />
      </WithStatefulUserData>
    );

    fireEvent.click(subject.getByText(RoadmapDefaults.operateDateSubmitButtonText));
    const currentMonthAndYear = dayjs().format("YYYY-MM");

    expect(currentUserData().onboardingData.dateOfFormation).toEqual(`${currentMonthAndYear}-01`);
  });

  it("displays next annual tax date from userData when dateOfFormation has been provided", () => {
    const annualFiling = generateTaxFiling({ dueDate: "2021-10-31" });
    const onboardingData = generateOnboardingData({
      dateOfFormation: "2020-10-01",
    });
    useMockUserData({
      onboardingData: onboardingData,
      taxFilings: [annualFiling],
    });

    const subject = render(<OperateSection displayContent={emptyContent} />);
    expect(subject.getByText("October 31st, 2021")).toBeInTheDocument();
  });

  it("brings back the datepicker when edit button is clicked", () => {
    const onboardingData = generateOnboardingData({
      dateOfFormation: "2020-04-01",
    });
    useMockUserData({
      onboardingData: onboardingData,
      taxFilings: [generateTaxFiling({})],
    });

    const subject = render(<OperateSection displayContent={emptyContent} />);
    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).toBeInTheDocument();
    fireEvent.click(subject.getByText(RoadmapDefaults.dateOfFormationEditText));

    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).not.toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeInTheDocument();
    expect((subject.getByTestId("date-textfield") as HTMLInputElement).value).toEqual("04/2020");
  });
});
