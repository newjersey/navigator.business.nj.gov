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

  it("extracts the section under a non-Eligibility heading", () => {
    const content = `## Eligible Expenses

- Electric vehicles and EV charging stations
- Program development and operation

:::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }

Previous awards have ranged between $100K to $8M.

:::`;
    const { eligibility, benefits } = parseFundingContent(content);
    expect(eligibility).toContain("Electric vehicles and EV charging stations");
    expect(eligibility).not.toContain("Eligible Expenses");
    expect(benefits).toContain("Previous awards have ranged between $100K to $8M.");
  });

  it("returns empty strings when there is no heading or callout", () => {
    const { eligibility, benefits } = parseFundingContent("No sections here.");
    expect(eligibility).toBe("");
    expect(benefits).toBe("");
  });

  it("trims whitespace from extracted sections", () => {
    const { eligibility, benefits } = parseFundingContent(SAMPLE_CONTENT_MD);
    expect(eligibility).toBe(eligibility.trim());
    expect(benefits).toBe(benefits.trim());
  });

  it("strips the |id suffix from inline code contextual info links", () => {
    const content = `## Eligibility\n\n- Must use a \`Qualified Incentive Track|qit-njeda\` designation\n\n:::largeCallout{ showHeader="true" headerText="Benefits:" calloutType="conditional" }\n\nSee \`program terms|some-id\` for details.\n\n:::`;
    const { eligibility, benefits } = parseFundingContent(content);
    expect(eligibility).toContain("Qualified Incentive Track");
    expect(eligibility).not.toContain("|qit-njeda");
    expect(benefits).toContain("program terms");
    expect(benefits).not.toContain("|some-id");
  });
});
