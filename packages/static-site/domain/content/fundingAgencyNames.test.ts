import { describe, expect, it } from "vitest";
import { withAgencyNames } from "./fundingAgencyNames";
import type { Funding, FundingAgency } from "./types";

const fundingAgencies: FundingAgency[] = [
  { id: "njeda", name: "NJ Economic Development Authority" },
  { id: "njdol", name: "NJ Department of Labor" },
];

const makeFunding = (agency: string[] | null | undefined): Funding =>
  ({ id: "a-funding", name: "A Funding", agency }) as Funding;

describe("withAgencyNames", () => {
  it("resolves agency ids to their names", () => {
    const [funding] = withAgencyNames({
      fundings: [makeFunding(["njdol"])],
      fundingAgencies,
    });

    expect(funding.agencyNames).toEqual(["NJ Department of Labor"]);
  });

  it("keeps the order the ids are listed in", () => {
    const [funding] = withAgencyNames({
      fundings: [makeFunding(["njdol", "njeda"])],
      fundingAgencies,
    });

    expect(funding.agencyNames).toEqual([
      "NJ Department of Labor",
      "NJ Economic Development Authority",
    ]);
  });

  it("drops ids that are not in the mapping", () => {
    const [funding] = withAgencyNames({
      fundings: [makeFunding(["not-an-agency", "njeda"])],
      fundingAgencies,
    });

    expect(funding.agencyNames).toEqual(["NJ Economic Development Authority"]);
  });

  it("returns an empty list when the funding has no agency ids", () => {
    const [funding] = withAgencyNames({
      fundings: [makeFunding(undefined)],
      fundingAgencies,
    });

    expect(funding.agencyNames).toEqual([]);
  });

  it("returns an empty list when the funding's agency field is null", () => {
    const [funding] = withAgencyNames({
      fundings: [makeFunding(null)],
      fundingAgencies,
    });

    expect(funding.agencyNames).toEqual([]);
  });

  it("preserves the rest of the funding", () => {
    const [funding] = withAgencyNames({
      fundings: [makeFunding(["njeda"])],
      fundingAgencies,
    });

    expect(funding.name).toBe("A Funding");
  });
});
