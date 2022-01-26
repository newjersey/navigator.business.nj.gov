import { OpportunityType } from "@/lib/types/types";
import OpportunityPage from "@/pages/opportunities/[opportunityUrlSlug]";
import { render } from "@testing-library/react";
import React from "react";

describe("opportunity page", () => {
  let subject;

  it("shows the opportunity details", () => {
    const opportunity = {
      id: "some-id",
      filename: "op2",
      name: "Some Opportunity Name",
      urlSlug: "some-url-slug",
      callToActionLink: "https://www.example.com",
      callToActionText: "Click here",
      contentMd: "Some content description",
      type: "CERTIFICATION" as OpportunityType,
    };

    subject = render(<OpportunityPage opportunity={opportunity} operateReferences={{}} />);

    expect(subject.getByText("Some Opportunity Name")).toBeInTheDocument();
    expect(subject.getByText("Click here")).toBeInTheDocument();
    expect(subject.getByText("Some content description")).toBeInTheDocument();
  });
});
