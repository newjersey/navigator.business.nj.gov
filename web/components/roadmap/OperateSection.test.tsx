import { fireEvent, render, RenderResult, within } from "@testing-library/react";
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
import { getByTextAcrossElements, queryByTextAcrossElements } from "@/test/helpers";
import { useMockDate } from "@/test/mock/useMockDate";
import { TaxFilingNameLookup } from "@/display-content/roadmap/operate/TaxFilingNameLookup";
import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/getCurrentDate", () => ({ getCurrentDate: jest.fn() }));

const emptyContent: OperateDisplayContent = {
  dateOfFormationMd: "",
  annualFilingMd: "",
};

describe("<OperateSection />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockDate("2021-10-01");
    useMockUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["OPERATE"],
      }),
    });

    setupStatefulUserDataContext();
  });

  const renderSection = (element: ReactNode): RenderResult => {
    return render(<ThemeProvider theme={createTheme()}>{element}</ThemeProvider>);
  };

  it("renders datepicker when dateOfFormation is undefined", () => {
    useMockOnboardingData({ dateOfFormation: undefined });
    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).not.toBeInTheDocument();
  });

  it("renders annual filing date when dateOfFormation is defined", () => {
    useMockOnboardingData({ dateOfFormation: "2020-01-01" });
    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).not.toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).toBeInTheDocument();
  });

  it("updates date of formation to the first day of the provided month and year", () => {
    const initialUserData = generateUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: undefined }),
    });
    const subject = renderSection(
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

    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
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

    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).toBeInTheDocument();
    fireEvent.click(subject.getByText(RoadmapDefaults.dateOfFormationEditText));

    expect(subject.queryByText(RoadmapDefaults.nextAnnualFilingText)).not.toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeInTheDocument();
    expect((subject.getByTestId("date-textfield") as HTMLInputElement).value).toEqual("04/2020");
  });

  it("displays next 12 months in calendar, starting in october", () => {
    useMockDate("2021-10-01");
    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({})],
    });

    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
    expect(getByTextAcrossElements(subject, "Oct 2021")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Nov 2021")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Dec 2021")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Jan 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Feb 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Mar 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Apr 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "May 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Jun 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Jul 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Aug 2022")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Sep 2022")).toBeInTheDocument();

    expect(queryByTextAcrossElements(subject, "Sep 2021")).not.toBeInTheDocument();
    expect(queryByTextAcrossElements(subject, "Oct 2022")).not.toBeInTheDocument();
  });

  it("displays next 12 months in calendar, starting in november", () => {
    useMockDate("2021-11-01");
    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({})],
    });

    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
    expect(getByTextAcrossElements(subject, "Nov 2021")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Oct 2022")).toBeInTheDocument();

    expect(queryByTextAcrossElements(subject, "Oct 2021")).not.toBeInTheDocument();
    expect(queryByTextAcrossElements(subject, "Nov 2022")).not.toBeInTheDocument();
  });

  it("displays the annual filing within the correct month", () => {
    useMockDate("2021-11-01");
    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({ identifier: "ANNUAL_FILING", dueDate: "2022-04-30" })],
    });

    const subject = renderSection(<OperateSection displayContent={emptyContent} />);
    const nextAnnualFilingMonth = subject.getByTestId("Apr 2022");
    expect(
      within(nextAnnualFilingMonth).getByText(RoadmapDefaults.calendarFilingDueDateLabel, { exact: false })
    ).toBeInTheDocument();
    expect(
      within(nextAnnualFilingMonth).getByText(TaxFilingNameLookup["ANNUAL_FILING"], { exact: false })
    ).toBeInTheDocument();
    expect(within(nextAnnualFilingMonth).getByText("4/30", { exact: false })).toBeInTheDocument();
  });
});
