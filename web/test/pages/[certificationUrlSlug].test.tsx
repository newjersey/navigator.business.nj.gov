import CertificationPage from "@/pages/certification/[certificationUrlSlug]";
import { generateCertification } from "@/test/factories";
import { render } from "@testing-library/react";
import React from "react";

describe("certification page", () => {
  let subject;

  it("shows the certification details", () => {
    const certification = generateCertification({
      name: "Some Cert Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
    });

    subject = render(<CertificationPage certification={certification} operateReferences={{}} />);

    expect(subject.getByText("Some Cert Name")).toBeInTheDocument();
    expect(subject.getByText("Click here")).toBeInTheDocument();
    expect(subject.getByText("Some content description")).toBeInTheDocument();
  });
});
