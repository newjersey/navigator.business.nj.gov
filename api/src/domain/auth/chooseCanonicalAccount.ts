import { UserData } from "@shared/userData";

const parseTimestamp = (value: string | undefined): number => {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const claimTimestamp = (userData: UserData): number => {
  return parseTimestamp(userData.user.emailSignInClaimedISO);
};

const activeBusinessCount = (userData: UserData): number => {
  return Object.values(userData.businesses).filter((business) => !business.dateDeletedISO).length;
};

const isMoreCanonical = (candidate: UserData, incumbent: UserData): boolean => {
  // A claim is final: once an account has claimed the email, no later activity on a
  // sibling can move where that email signs in.
  const candidateClaim = claimTimestamp(candidate);
  const incumbentClaim = claimTimestamp(incumbent);
  if (candidateClaim !== incumbentClaim) {
    return incumbentClaim === Number.NEGATIVE_INFINITY || candidateClaim < incumbentClaim;
  }

  const candidateUpdated = parseTimestamp(candidate.lastUpdatedISO);
  const incumbentUpdated = parseTimestamp(incumbent.lastUpdatedISO);
  if (candidateUpdated !== incumbentUpdated) {
    return candidateUpdated > incumbentUpdated;
  }

  const candidateBusinesses = activeBusinessCount(candidate);
  const incumbentBusinesses = activeBusinessCount(incumbent);
  if (candidateBusinesses !== incumbentBusinesses) {
    return candidateBusinesses > incumbentBusinesses;
  }

  return candidate.user.id < incumbent.user.id;
};

export const chooseCanonicalAccount = (candidates: UserData[]): UserData | undefined => {
  let canonical: UserData | undefined;
  for (const candidate of candidates) {
    if (!canonical || isMoreCanonical(candidate, canonical)) {
      canonical = candidate;
    }
  }
  return canonical;
};
