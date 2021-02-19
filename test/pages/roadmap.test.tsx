import { RenderResult } from "@testing-library/react";
import { renderWithFormData } from "../helpers";
import Roadmap from "../../pages/roadmap";
import { generateFormData } from "../factories";

describe("roadmap page", () => {
  let subject: RenderResult;

  it("shows the business name from form data", () => {
    subject = renderWithFormData(
      <Roadmap />,
      generateFormData({
        businessName: { businessName: "My cool business" },
      })
    );
    expect(subject.getByText("Business Roadmap for My cool business")).toBeInTheDocument();
  });

  it("shows default title if no business name present", () => {
    subject = renderWithFormData(
      <Roadmap />,
      generateFormData({
        businessName: { businessName: undefined },
      })
    );
    expect(subject.getByText("Your Business Roadmap")).toBeInTheDocument();
  });

  describe("business structure", () => {
    it("shows search business name step if structure in PublicRecordFiling group", () => {
      subject = renderWithFormData(
        <Roadmap />,
        generateFormData({
          businessStructure: { businessStructure: "Limited Liability Company (LLC)" },
        })
      );
      expect(subject.queryByText("3 - Form & Register Your Business", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("Search for Available Business Names")).toBeInTheDocument();
      expect(subject.queryByText("Register a Trade Name")).not.toBeInTheDocument();
    });

    it("shows trade name step if structure in TradeName group", () => {
      subject = renderWithFormData(
        <Roadmap />,
        generateFormData({
          businessStructure: { businessStructure: "General Partnership" },
        })
      );
      expect(subject.queryByText("3 - Form & Register Your Business", { exact: false })).toBeInTheDocument();
      expect(subject.queryByText("Search for Available Business Names")).not.toBeInTheDocument();
      expect(subject.queryByText("Register a Trade Name")).toBeInTheDocument();
    });
  });

  describe("liquor license", () => {
    it("does not show liquor license step if no locations", () => {
      subject = renderWithFormData(
        <Roadmap />,
        generateFormData({
          locations: {},
        })
      );
      expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
      expect(
        subject.queryByText("Confirm liquor license availability", { exact: false })
      ).not.toBeInTheDocument();
    });

    it("does not show liquor license step if no location includes it", () => {
      subject = renderWithFormData(
        <Roadmap />,
        generateFormData({
          locations: { locations: [{ license: false }] },
        })
      );
      expect(subject.queryByText("Obtain your Liquor License", { exact: false })).not.toBeInTheDocument();
      expect(
        subject.queryByText("Confirm liquor license availability", { exact: false })
      ).not.toBeInTheDocument();
    });

    it("shows liquor license step if any location includes it", () => {
      subject = renderWithFormData(
        <Roadmap />,
        generateFormData({
          locations: { locations: [{ license: true }, { license: false }] },
        })
      );
      expect(subject.queryByText("Obtain your Liquor License", { exact: false })).toBeInTheDocument();
      expect(
        subject.queryByText("Confirm liquor license availability", { exact: false })
      ).toBeInTheDocument();
    });
  });
});
