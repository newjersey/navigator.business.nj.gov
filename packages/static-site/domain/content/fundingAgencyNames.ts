/**
 * Resolves the agency ids stored on a funding to their display names.
 *
 * Content stores issuing agencies on a funding as ids from the
 * `fundingAgency` mapping, so anything that displays an agency has to resolve
 * the name first. Doing it once at load time keeps that lookup out of
 * components and reusable anywhere a funding is read.
 */

import type { Funding, FundingAgency } from "./types";

export interface WithAgencyNamesParams {
  /** Fundings to resolve agency names for. */
  readonly fundings: readonly Funding[];
  /** The full funding agency mapping. */
  readonly fundingAgencies: readonly FundingAgency[];
}

/**
 * Returns the display names for the given agency ids.
 *
 * Ids missing from the mapping are dropped: content occasionally carries an
 * id that no longer exists, and a raw id is not useful to a reader. A funding
 * with no agencies set resolves to an empty list.
 *
 * @param agencyIds Agency ids stored on a funding.
 * @param fundingAgencies The full funding agency mapping.
 * @returns Matching agency names, in the order the ids were given.
 */
const resolveAgencyNames = (
  agencyIds: readonly string[] | null | undefined,
  fundingAgencies: readonly FundingAgency[],
): string[] =>
  (agencyIds ?? []).flatMap((agencyId) => {
    const agency = fundingAgencies.find((candidate) => candidate.id === agencyId);
    return agency ? [agency.name] : [];
  });

/**
 * Attaches resolved issuing agency names to each funding.
 *
 * @param params Input params.
 * @param params.fundings Fundings to resolve agency names for.
 * @param params.fundingAgencies The full funding agency mapping.
 * @returns The fundings, each with an `agencyNames` list.
 */
export const withAgencyNames = ({ fundings, fundingAgencies }: WithAgencyNamesParams): Funding[] =>
  fundings.map((funding) => ({
    ...funding,
    agencyNames: resolveAgencyNames(funding.agency, fundingAgencies),
  }));
