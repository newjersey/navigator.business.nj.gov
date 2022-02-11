import FundingPage from "@/pages/funding/[fundingUrlSlug]";
import { generateFunding } from "@/test/factories";
import { render } from "@testing-library/react";
import React from "react";

describe("funding page", () => {
  let subject;

  it("shows the funding details", () => {
    const funding = generateFunding({
      name: "Some Funding Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
    });

    subject = render(<FundingPage funding={funding} operateReferences={{}} />);

    expect(subject.getByText("Some Funding Name")).toBeInTheDocument();
    expect(subject.getByText("Click here")).toBeInTheDocument();
    expect(subject.getByText("Some content description")).toBeInTheDocument();
  });
});
