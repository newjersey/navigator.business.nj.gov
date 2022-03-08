import FilingPage from "@/pages/filings/[filingUrlSlug]";
import { generateProfileData, generateTaxFiling, generateTaxFilingData } from "@/test/factories";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { useMockDate } from "@/test/mock/useMockDate";
import { render } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/getCurrentDate", () => ({ getCurrentDate: jest.fn() }));

describe("filing page", () => {
  let subject;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows the filing details and correct due date", () => {
    useMockDate("2021-11-01");

    useMockUserData({
      profileData: generateProfileData({ entityId: "1234567890" }),
      taxFilingData: generateTaxFilingData({
        filings: [
          generateTaxFiling({}),
          generateTaxFiling({ identifier: "filing-identifier-1", dueDate: "2022-04-30" }),
        ],
      }),
    });

    const filing = {
      id: "filing-identifier-1",
      filename: "filename-1",
      name: "filing-name-1",
      urlSlug: "url-slug-1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
    };

    subject = render(<FilingPage filing={filing} operateReferences={{}} />);

    expect(subject.getByText("filing-name-1")).toBeInTheDocument();
    expect(subject.getByText("cta-text-1")).toBeInTheDocument();
    expect(subject.getByText("content-1")).toBeInTheDocument();
    expect(subject.getByTestId("due-date")).toHaveTextContent("04/30/2022");
  });
});
