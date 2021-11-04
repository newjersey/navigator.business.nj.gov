import { fireEvent, render, RenderResult, within } from "@testing-library/react";
import { OperateSection } from "@/components/roadmap/OperateSection";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  generatePreferences,
  generateProfileData,
  generateTaxFiling,
  generateTaxFilingData,
  generateUserData,
} from "@/test/factories";
import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import {
  currentUserData,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { EntityIdStatus, FilingReference, OperateDisplayContent, UserData } from "@/lib/types/types";
import { getByTextAcrossElements, queryByTextAcrossElements } from "@/test/helpers";
import { useMockDate } from "@/test/mock/useMockDate";
import { createTheme, ThemeProvider } from "@mui/material";
import React, { ReactNode } from "react";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/getCurrentDate", () => ({ getCurrentDate: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const emptyContent: OperateDisplayContent = {
  entityIdMd: "",
  filingCalendarMd: "",
  entityIdErrorNotRegisteredMd: "ENTITY ID NOT REGISTERED",
  entityIdErrorNotFoundMd: "ENTITY ID NOT FOUND",
};

const emptyFilings: Record<string, FilingReference> = {};

describe("<OperateSection />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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

  const statefulRender = (initialData: UserData = generateUserData({})): RenderResult => {
    return renderSection(
      <WithStatefulUserData initialUserData={initialData}>
        <OperateSection displayContent={emptyContent} filingsReferences={emptyFilings} />
      </WithStatefulUserData>
    );
  };

  describe("entity id form", () => {
    const renderWithEntityIdStatus = (status: EntityIdStatus): RenderResult => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useMockUserData({
        taxFilingData: generateTaxFilingData({
          entityIdStatus: status,
          filings: [],
        }),
      });

      return renderSection(<OperateSection displayContent={emptyContent} filingsReferences={emptyFilings} />);
    };

    describe("when to show form", () => {
      it("shows form when entity ID status is UNKNOWN", () => {
        const subject = renderWithEntityIdStatus("UNKNOWN");
        expect(subject.getByLabelText("Entity id")).toBeInTheDocument();
      });

      it("shows form when entity ID status is NOT_FOUND", () => {
        const subject = renderWithEntityIdStatus("NOT_FOUND");
        expect(subject.getByLabelText("Entity id")).toBeInTheDocument();
      });

      it("shows form when entity ID status is EXISTS_NOT_REGISTERED", () => {
        const subject = renderWithEntityIdStatus("EXISTS_NOT_REGISTERED");
        expect(subject.getByLabelText("Entity id")).toBeInTheDocument();
      });

      it("does not show form when entity ID status is EXISTS_AND_REGISTERED", () => {
        useMockDate("2021-10-01");
        const subject = renderWithEntityIdStatus("EXISTS_AND_REGISTERED");
        expect(subject.queryByLabelText("Entity id")).not.toBeInTheDocument();
      });
    });

    const emptyEntityIdData = generateUserData({
      profileData: generateProfileData({
        entityId: undefined,
      }),
      taxFilingData: generateTaxFilingData({
        entityIdStatus: "UNKNOWN",
        filings: [],
      }),
    });

    it("enters and submits entity id if it does not exist", () => {
      const subject = statefulRender(emptyEntityIdData);

      fireEvent.change(subject.getByLabelText("Entity id"), { target: { value: "1234567890" } });
      fireEvent.submit(subject.getByText(RoadmapDefaults.operateFormSubmitButtonText));

      expect(currentUserData().profileData.entityId).toEqual("1234567890");
    });

    it("overwrites existing taxFilingData with new entity ID", () => {
      const existingData = generateUserData({
        profileData: generateProfileData({ entityId: "1111111111" }),
        taxFilingData: generateTaxFilingData({
          entityIdStatus: "EXISTS_NOT_REGISTERED",
          filings: [generateTaxFiling({})],
        }),
      });
      const subject = statefulRender(existingData);

      fireEvent.change(subject.getByLabelText("Entity id"), { target: { value: "1234567890" } });
      fireEvent.submit(subject.getByText(RoadmapDefaults.operateFormSubmitButtonText));

      expect(currentUserData().profileData.entityId).toEqual("1234567890");
      expect(currentUserData().taxFilingData.entityIdStatus).toEqual("UNKNOWN");
      expect(currentUserData().taxFilingData.filings).toEqual([]);
    });

    it("does not submit if entity ID is invalid", () => {
      const subject = statefulRender(emptyEntityIdData);

      fireEvent.change(subject.getByLabelText("Entity id"), { target: { value: "1234567890" } });
      fireEvent.submit(subject.getByText(RoadmapDefaults.operateFormSubmitButtonText));

      fireEvent.change(subject.getByLabelText("Entity id"), { target: { value: "12345" } });
      fireEvent.blur(subject.getByLabelText("Entity id"));
      fireEvent.submit(subject.getByText(RoadmapDefaults.operateFormSubmitButtonText));

      expect(currentUserData().profileData.entityId).toEqual("1234567890");
    });

    it("displays error text if submitted entity ID does not exist", () => {
      const subject = renderWithEntityIdStatus("NOT_FOUND");
      expect(subject.getByText("ENTITY ID NOT FOUND")).toBeInTheDocument();
    });

    it("displays error text if submitted entity ID is not registered for taxes", () => {
      const subject = renderWithEntityIdStatus("EXISTS_NOT_REGISTERED");
      expect(subject.getByText("ENTITY ID NOT REGISTERED")).toBeInTheDocument();
    });
  });

  describe("calendar view", () => {
    it("displays next 12 months in calendar, starting in october", () => {
      useMockDate("2021-10-01");

      useMockUserData({
        profileData: generateProfileData({ dateOfFormation: "2020-04-01" }),
        taxFilingData: generateTaxFilingData({
          entityIdStatus: "EXISTS_AND_REGISTERED",
          filings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1" })],
        }),
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
        profileData: generateProfileData({ dateOfFormation: "2020-04-01" }),
        taxFilingData: generateTaxFilingData({
          entityIdStatus: "EXISTS_AND_REGISTERED",
          filings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1" })],
        }),
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
        profileData: generateProfileData({ dateOfFormation: "2020-04-01" }),
        taxFilingData: generateTaxFilingData({
          entityIdStatus: "EXISTS_AND_REGISTERED",
          filings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1", dueDate: "2022-04-30" })],
        }),
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

    it("displays filings within a month in chronological order", () => {
      useMockDate("2021-11-01");

      useMockUserData({
        profileData: generateProfileData({ dateOfFormation: "2020-04-01" }),
        taxFilingData: generateTaxFilingData({
          entityIdStatus: "EXISTS_AND_REGISTERED",
          filings: [
            generateTaxFiling({ identifier: "later-filing", dueDate: "2022-04-30" }),
            generateTaxFiling({ identifier: "early-filing", dueDate: "2022-04-01" }),
          ],
        }),
      });

      const filingRef: Record<string, FilingReference> = {
        "later-filing": { name: "Later Filing", urlSlug: "" },
        "early-filing": { name: "Early Filing", urlSlug: "" },
      };

      const subject = renderSection(
        <OperateSection displayContent={emptyContent} filingsReferences={filingRef} />
      );

      const filingsInOrderOnPage = subject.getAllByTestId("filing").map((it) => it.textContent);
      expect(filingsInOrderOnPage[0]).toContain("Early Filing");
      expect(filingsInOrderOnPage[1]).toContain("Later Filing");
    });
  });
});
