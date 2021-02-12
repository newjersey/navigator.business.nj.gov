import { RenderResult } from "@testing-library/react";
import { renderWithFormData } from "../helpers";
import Roadmap from "../../pages/roadmap";

describe("roadmap page", () => {
  let subject: RenderResult;

  it("shows the business name from form data", () => {
    subject = renderWithFormData(<Roadmap />, {
      businessName: { businessName: "My cool business" },
    });
    expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
  });

  it("shows default title if no business name present", () => {
    subject = renderWithFormData(<Roadmap />, {
      businessName: {},
    });
    expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
  });

  describe("liquor license", () => {
    it("does not show liquor license step if no locations", () => {
      subject = renderWithFormData(<Roadmap />, {
        locations: {},
      });
      expect(subject.queryByText("Obtain a Liquor License", { exact: false })).not.toBeInTheDocument();

      subject = renderWithFormData(<Roadmap />, {
        locations: { locations: [] },
      });
      expect(subject.queryByText("Obtain a Liquor License", { exact: false })).not.toBeInTheDocument();
    });

    it("does not show liquor license step if no location includes it", () => {
      subject = renderWithFormData(<Roadmap />, {
        locations: { locations: [{ license: false }] },
      });
      expect(subject.queryByText("Obtain a Liquor License", { exact: false })).not.toBeInTheDocument();
    });

    it("shows liquor license step if any location includes it", () => {
      subject = renderWithFormData(<Roadmap />, {
        locations: { locations: [{ license: true }, { license: false }] },
      });
      expect(subject.queryByText("Obtain a Liquor License", { exact: false })).toBeInTheDocument();
    });
  });
});
