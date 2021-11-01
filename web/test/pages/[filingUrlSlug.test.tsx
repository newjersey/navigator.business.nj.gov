import { render } from "@testing-library/react";
import FilingPage from "@/pages/filings/[filingUrlSlug]";
import { useMockUserData } from "../mock/mockUseUserData";
import { generateProfileData, generateTaxFiling } from "../factories";
import { useMockDate } from "../mock/useMockDate";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/getCurrentDate", () => ({ getCurrentDate: jest.fn() }));

describe("filing page", () => {
  let subject;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows the filing details and due date", () => {
    useMockDate("2021-11-01");

    useMockUserData({
      profileData: generateProfileData({ dateOfFormation: "2020-04-01" }),
      taxFilings: [generateTaxFiling({ identifier: "some-tax-filing-identifier-1", dueDate: "2022-04-30" })],
    });

    const filing = {
      id: "id-1",
      filename: "filename-1",
      name: "filing-name-1",
      urlSlug: "url-slug-1",
      callToActionLink: "cta-link-1",
      callToActionText: "cta-text-1",
      contentMd: "content-1",
    };

    subject = render(<FilingPage filing={filing} filingsReferences={{}} />);

    expect(subject.getByText("filing-name-1")).toBeInTheDocument();
    expect(subject.getByText("cta-text-1")).toBeInTheDocument();
    expect(subject.getByText("content-1")).toBeInTheDocument();
    expect(subject.getByTestId("due-date")).toHaveTextContent("04/30/2022");
  });
});
