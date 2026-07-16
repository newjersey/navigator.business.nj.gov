import { renderWithUserData } from "@/test/render/renderWithUserData";
import CertificationPage from "@/pages/certification/[certificationUrlSlug]";
import { generateCertification } from "@/test/factories";
import { screen } from "@testing-library/react";

describe("certification page", () => {
  it("shows the certification details", () => {
    const certification = generateCertification({
      name: "Some Cert Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
    });

    renderWithUserData(<CertificationPage certification={certification} />);

    expect(screen.getByText("Some Cert Name")).toBeInTheDocument();
    expect(screen.getByText("Click here")).toBeInTheDocument();
    expect(screen.getByText("Some content description")).toBeInTheDocument();
  });
});
