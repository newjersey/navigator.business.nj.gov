import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import { OperateSection } from "@/components/roadmap/OperateSection";
import { useMockUserData } from "@/test/mock/mockUseUserData";
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
import { FilingReference, OperateDisplayContent } from "@/lib/types/types";
import { getByTextAcrossElements, queryByTextAcrossElements } from "@/test/helpers";
import { useMockDate } from "@/test/mock/useMockDate";
import { createTheme, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/getCurrentDate", () => ({ getCurrentDate: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const emptyContent: OperateDisplayContent = {
  dateOfFormationMd: "",
  annualFilingMd: "",
};

const emptyFilings: Record<string, FilingReference> = {};

describe("<OperateSection />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockDate("2021-10-01");
    useMockUserData({
      preferences: generatePreferences({
        roadmapOpenSections: ["OPERATE"],
      }),
    });
    useMockRoadmap({});
    setupStatefulUserDataContext();
  });

  const renderSection = (element: ReactNode): RenderResult => {
    return render(<ThemeProvider theme={createTheme()}>{element}</ThemeProvider>);
  };

  it("renders datepicker when dateOfFormation is undefined", () => {
    const subject = renderSection(
      <OperateSection displayContent={emptyContent} filingsReferences={emptyFilings} />
    );
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.calendarHeader)).not.toBeInTheDocument();
  });

  it("renders calendar when dateOfFormation is defined", () => {
    useMockDate("2021-11-01");

    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-01-01" }),
      taxFilings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1" })],
    });

    const filingRef: Record<string, FilingReference> = {
      "some-tax-filing-identifier-1": {
        name: "some-name-1",
        urlSlug: "some-urlSlug-1",
      },
    };

    const subject = renderSection(
      <OperateSection displayContent={emptyContent} filingsReferences={filingRef} />
    );
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).not.toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.calendarHeader)).toBeInTheDocument();
  });

  it("updates date of formation to the first day of the provided month and year", () => {
    const initialUserData = generateUserData({
      taxFilings: [],
      onboardingData: generateOnboardingData({ dateOfFormation: undefined }),
    });
    const subject = renderSection(
      <WithStatefulUserData initialUserData={initialUserData}>
        <OperateSection displayContent={emptyContent} filingsReferences={emptyFilings} />
      </WithStatefulUserData>
    );

    fireEvent.click(subject.getByText(RoadmapDefaults.operateDateSubmitButtonText));
    const currentMonthAndYear = dayjs().format("YYYY-MM");

    expect(currentUserData().onboardingData.dateOfFormation).toEqual(`${currentMonthAndYear}-01`);
  });

  it("brings back the datepicker when edit button is clicked", () => {
    useMockDate("2021-11-01");

    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1" })],
    });

    const filingRef: Record<string, FilingReference> = {
      "some-tax-filing-identifier-1": {
        name: "some-name-1",
        urlSlug: "some-urlSlug-1",
      },
    };

    const subject = renderSection(
      <OperateSection displayContent={emptyContent} filingsReferences={filingRef} />
    );
    expect(subject.queryByText(RoadmapDefaults.calendarHeader)).toBeInTheDocument();
    fireEvent.click(subject.getByText(RoadmapDefaults.dateOfFormationEditText));

    expect(subject.queryByText(RoadmapDefaults.calendarHeader)).not.toBeInTheDocument();
    expect(subject.queryByText(RoadmapDefaults.operateDateSubmitButtonText)).toBeInTheDocument();
    expect((subject.getByTestId("date-of-formation-textfield") as HTMLInputElement).value).toEqual("04/2020");
  });

  it("displays next 12 months in calendar, starting in october", () => {
    useMockDate("2021-10-01");

    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1" })],
    });

    const filingRef: Record<string, FilingReference> = {
      "some-tax-filing-identifier-1": {
        name: "some-name-1",
        urlSlug: "some-urlSlug-1",
      },
    };

    const subject = renderSection(
      <OperateSection displayContent={emptyContent} filingsReferences={filingRef} />
    );
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
      taxFilings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1" })],
    });

    const filingRef: Record<string, FilingReference> = {
      "some-tax-filing-identifier-1": {
        name: "some-name-1",
        urlSlug: "some-urlSlug-1",
      },
    };

    const subject = renderSection(
      <OperateSection displayContent={emptyContent} filingsReferences={filingRef} />
    );
    expect(getByTextAcrossElements(subject, "Nov 2021")).toBeInTheDocument();
    expect(getByTextAcrossElements(subject, "Oct 2022")).toBeInTheDocument();

    expect(queryByTextAcrossElements(subject, "Oct 2021")).not.toBeInTheDocument();
    expect(queryByTextAcrossElements(subject, "Nov 2022")).not.toBeInTheDocument();
  });

  it("displays the annual filing within the correct month", () => {
    useMockDate("2021-11-01");

    useMockUserData({
      onboardingData: generateOnboardingData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1", dueDate: "2022-04-30" })],
    });

    const filingRef: Record<string, FilingReference> = {
      "some-tax-filing-identifier-1": {
        name: "some-name-1",
        urlSlug: "some-urlSlug-1",
      },
    };

    const subject = renderSection(
      <OperateSection displayContent={emptyContent} filingsReferences={filingRef} />
    );
    const nextAnnualFilingMonth = subject.getByTestId("Apr 2022");

    expect(
      within(nextAnnualFilingMonth).getByText(RoadmapDefaults.calendarFilingDueDateLabel, { exact: false })
    ).toBeInTheDocument();
    expect(within(nextAnnualFilingMonth).getByText("some-name-1", { exact: false })).toBeInTheDocument();
    expect(within(nextAnnualFilingMonth).getByText("4/30", { exact: false })).toBeInTheDocument();
  });
});
