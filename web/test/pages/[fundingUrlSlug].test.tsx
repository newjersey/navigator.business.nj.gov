import FundingPage from "@/pages/funding/[fundingUrlSlug]";
import { generateFunding } from "@/test/factories";
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

    render(<FundingPage funding={funding} operateReferences={{}} />);

    expect(screen.getByText("Some Funding Name")).toBeInTheDocument();
    expect(screen.getByText("DUE: 07/01/2025")).toBeInTheDocument();
    expect(screen.getByText("DEADLINE")).toBeInTheDocument();
    expect(screen.getByText("Click here")).toBeInTheDocument();
    expect(screen.getByText("Some content description")).toBeInTheDocument();
  });
});
