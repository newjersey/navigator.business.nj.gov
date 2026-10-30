export const MYNJ_PROVIDER_NAME = "myNJ";
export const PROFILE_NJ_PROVIDER_NAME = "ProfileNJ";
export const PROFILE_NJ_RESIDENT_ID_ATTRIBUTE = "custom:profileNJResidentId";

export type SignInProvider = typeof MYNJ_PROVIDER_NAME | typeof PROFILE_NJ_PROVIDER_NAME;

export interface FederatedIdentityClaim {
  readonly providerName: string;
  readonly userId: string;
}

export interface SignedInUserClaims {
  readonly sub: string;
  readonly identities?: readonly FederatedIdentityClaim[];
  readonly [PROFILE_NJ_RESIDENT_ID_ATTRIBUTE]?: string;
}

export class MissingResidentIdError extends Error {
  constructor() {
    super(`ProfileNJ token is missing ${PROFILE_NJ_RESIDENT_ID_ATTRIBUTE}`);
    this.name = "MissingResidentIdError";
  }
}

const findIdentity = (
  claims: SignedInUserClaims,
  providerName: SignInProvider,
): FederatedIdentityClaim | undefined => {
  return claims.identities?.find((identity) => identity.providerName === providerName);
};

export const getSignInProvider = (claims: SignedInUserClaims): SignInProvider | undefined => {
  if (findIdentity(claims, MYNJ_PROVIDER_NAME)) return MYNJ_PROVIDER_NAME;
  if (findIdentity(claims, PROFILE_NJ_PROVIDER_NAME)) return PROFILE_NJ_PROVIDER_NAME;
  return undefined;
};

// ProfileNJ's `sub` is internal to its credentials service and may change, so a
// ProfileNJ user without a resident ID must fail rather than be keyed on `sub`.
export const resolveSignedInUserId = (claims: SignedInUserClaims): string => {
  const myNJIdentity = findIdentity(claims, MYNJ_PROVIDER_NAME);
  if (myNJIdentity?.userId) return myNJIdentity.userId;

  if (findIdentity(claims, PROFILE_NJ_PROVIDER_NAME)) {
    const residentId = claims[PROFILE_NJ_RESIDENT_ID_ATTRIBUTE];
    if (!residentId) throw new MissingResidentIdError();
    return residentId;
  }

  return claims.sub;
};
