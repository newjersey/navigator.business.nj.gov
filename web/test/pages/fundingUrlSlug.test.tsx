import FundingPage from "@/pages/funding/[fundingUrlSlug]";
import { generateFunding } from "@/test/factories";
import { LookupFundingAgencyById } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

describe("funding page", () => {
  it("shows the funding details", () => {
    const funding = generateFunding({
      name: "Some Funding Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
      dueDate: "07/01/2025",
      status: "deadline",
    });

    render(<FundingPage funding={funding} />);

    expect(screen.getByText("Some Funding Name")).toBeInTheDocument();
    expect(screen.getByText("DUE: 07/01/2025")).toBeInTheDocument();
    expect(screen.getByText("Click here")).toBeInTheDocument();
    expect(screen.getByText("Some content description")).toBeInTheDocument();
  });

  it("looks up and shows the agency name if one exists", () => {
    const funding = generateFunding({
      agency: ["njeda"],
    });

    render(<FundingPage funding={funding} />);

    expect(screen.getByTestId("funding-agency-header")).toBeInTheDocument();
    const expectedText = LookupFundingAgencyById("njeda").name;
    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });

  it("comma-separates multiple agencies", () => {
    const funding = generateFunding({
      agency: ["njeda", "njdol"],
    });

    render(<FundingPage funding={funding} />);

    const edaText = LookupFundingAgencyById("njeda").name;
    const dolText = LookupFundingAgencyById("njdol").name;
    expect(screen.getByText(`${edaText}, ${dolText}`)).toBeInTheDocument();
  });

  it("does not show the agency name header if one doesn't exist", () => {
    const funding = generateFunding({
      name: "Some Funding Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
      dueDate: "07/01/2025",
      status: "deadline",
      agency: [],
    });

    render(<FundingPage funding={funding} />);

    expect(screen.queryByTestId("funding-agency-header")).not.toBeInTheDocument();
  });

  describe("status", () => {
    it("shows status when status is first come, first serve", () => {
      const funding = generateFunding({
        name: "Some Funding Name",
        callToActionText: "Click here",
        contentMd: "Some content description",
        dueDate: "",
        status: "first come, first serve",
        agency: [],
      });

      render(<FundingPage funding={funding} />);

      expect(screen.getByText("FIRST COME, FIRST SERVE")).toBeInTheDocument();
    });

    it("shows status when status is deadline with no due date", () => {
      const funding = generateFunding({
        name: "Some Funding Name",
        callToActionText: "Click here",
        contentMd: "Some content description",
        dueDate: "",
        status: "deadline",
        agency: [],
      });

      render(<FundingPage funding={funding} />);

      expect(screen.getByText("DEADLINE")).toBeInTheDocument();
    });

    it("does not show status when status is deadline with a due date", () => {
      const funding = generateFunding({
        name: "Some Funding Name",
        callToActionText: "Click here",
        contentMd: "Some content description",
        dueDate: "07/25/2030",
        status: "deadline",
        agency: [],
      });

      render(<FundingPage funding={funding} />);

      expect(screen.queryByText("DEADLINE")).not.toBeInTheDocument();
    });
  });
});
