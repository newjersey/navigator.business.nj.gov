import FilingPage from "@/pages/filings/[filingUrlSlug]";
import { generateProfileData, generateTaxFiling, generateTaxFilingData } from "@/test/factories";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("filing page", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows the filing details and correct due date", () => {
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

    render(<FilingPage filing={filing} operateReferences={{}} />);

    expect(screen.getByText("filing-name-1")).toBeInTheDocument();
    expect(screen.getByText("cta-text-1")).toBeInTheDocument();
    expect(screen.getByText("content-1")).toBeInTheDocument();
    expect(screen.getByTestId("due-date")).toHaveTextContent("04/30/2022");
  });
});
