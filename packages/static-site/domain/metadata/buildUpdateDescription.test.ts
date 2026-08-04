import { describe, expect, it } from "vitest";

import { buildUpdateDescription } from "./buildUpdateDescription";

describe("buildUpdateDescription", () => {
  it("uses only the first paragraph of the body", () => {
    const body = [
      "Eligible companies can receive grants worth up to $500,000 per business to relocate",
      "out-of-State, NJ-resident employees back to New Jersey.",
      "",
      "### Eligibility",
      "",
      "Applicants must have an active Certificate of Approval.",
    ].join("\n");

    expect(buildUpdateDescription({ body })).toBe(
      "Eligible companies can receive grants worth up to $500,000 per business to relocate out-of-State, NJ-resident employees back to New Jersey.",
    );
  });

  it("strips markdown emphasis, keeping the inner text", () => {
    const body =
      "Calling all startups who want to access capital from the **New Jersey Innovation Evergreen Fund (NJIEF). **The NJIEF is catalyzing up to $600 million in support.";

    expect(buildUpdateDescription({ body })).toBe(
      "Calling all startups who want to access capital from the New Jersey Innovation Evergreen Fund (NJIEF). The NJIEF is catalyzing up to $600 million in support.",
    );
  });

  it("strips markdown links down to their label", () => {
    const body =
      "The [2022 Summer Youth Camp Grant](https://www.childcarenj.gov/grants.pdf) application is now available.";

    expect(buildUpdateDescription({ body })).toBe(
      "The 2022 Summer Youth Camp Grant application is now available.",
    );
  });

  it("strips content directives and contextual-info spans", () => {
    const body = [
      ':::infoAlert{ headerText="Keep in mind:" }',
      "Contact your `Local Enforcing Agency (LEA)|lea` before applying.",
      ":::",
    ].join("\n");

    expect(buildUpdateDescription({ body })).toBe(
      "Contact your Local Enforcing Agency (LEA) before applying.",
    );
  });

  it("drops trailing zero-width joiners and collapses whitespace", () => {
    const body = "Grants are now open for eligible businesses.\n\n‍\n";

    expect(buildUpdateDescription({ body })).toBe("Grants are now open for eligible businesses.");
  });

  it("truncates on a word boundary near 160 characters and appends an ellipsis", () => {
    const body =
      "Eligible companies can receive grants worth up to five hundred thousand dollars per business to relocate out-of-State, New Jersey-resident employees back to the great state of New Jersey.";

    const description = buildUpdateDescription({ body });

    expect(description.length).toBeLessThanOrEqual(160);
    expect(description.endsWith("…")).toBe(true);
    expect(body.startsWith(description.slice(0, -1))).toBe(true);
  });

  it("returns an empty string for a blank body", () => {
    expect(buildUpdateDescription({ body: "   " })).toBe("");
  });
});
