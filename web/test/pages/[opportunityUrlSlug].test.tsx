import OpportunityPage from "@/pages/opportunities/[opportunityUrlSlug]";
import { generateOpportunity } from "@/test/factories";
import { render } from "@testing-library/react";
import React from "react";

describe("opportunity page", () => {
  let subject;

  it("shows the opportunity details", () => {
    const opportunity = generateOpportunity({
      name: "Some Opportunity Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
    });

    subject = render(<OpportunityPage opportunity={opportunity} operateReferences={{}} />);

    expect(subject.getByText("Some Opportunity Name")).toBeInTheDocument();
    expect(subject.getByText("Click here")).toBeInTheDocument();
    expect(subject.getByText("Some content description")).toBeInTheDocument();
  });
});
