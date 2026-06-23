import { describe, expect, it } from "vitest";
import { parseFundingContent } from "./parseFundingContent";

const SAMPLE_CONTENT_MD = `
## Eligibility

- Your business must be registered in New Jersey
- Enroll at least 1 apprentice in your program

:::largeCallout{ showHeader="true" headerText="Benefits:" calloutType="conditional" }

The tax credit ranges from $5,000 to $10,000.

:::
`;

describe("parseFundingContent", () => {
  it("extracts eligibility bullets", () => {
    const { eligibility } = parseFundingContent(SAMPLE_CONTENT_MD);
    expect(eligibility).toContain("Your business must be registered in New Jersey");
    expect(eligibility).toContain("Enroll at least 1 apprentice in your program");
  });

  it("extracts benefits text", () => {
    const { benefits } = parseFundingContent(SAMPLE_CONTENT_MD);
    expect(benefits).toContain("The tax credit ranges from $5,000 to $10,000.");
  });

  it("returns empty strings when sections are missing", () => {
    const { eligibility, benefits } = parseFundingContent("No sections here.");
    expect(eligibility).toBe("");
    expect(benefits).toBe("");
  });

  it("trims whitespace from extracted sections", () => {
    const { eligibility, benefits } = parseFundingContent(SAMPLE_CONTENT_MD);
    expect(eligibility).toBe(eligibility.trim());
    expect(benefits).toBe(benefits.trim());
  });
});
