import {
  getSignInProvider,
  MissingResidentIdError,
  resolveSignedInUserId,
  SignedInUserClaims,
} from "./signedInUser";

const RESIDENT_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

const myNJClaims: SignedInUserClaims = {
  sub: "cognito-sub",
  identities: [{ providerName: "myNJ", userId: "mynj-123" }],
};

const profileNJClaims = (residentId?: string): SignedInUserClaims => {
  return {
    sub: "cognito-sub",
    identities: [{ providerName: "ProfileNJ", userId: "auth0|abc123" }],
    ...(residentId === undefined ? {} : { "custom:profileNJResidentId": residentId }),
  };
};

describe("signedInUser", () => {
  describe("resolveSignedInUserId", () => {
    it("returns the myNJ identity's userId for a myNJ user", () => {
      expect(resolveSignedInUserId(myNJClaims)).toEqual("mynj-123");
    });

    it("returns the resident ID for a ProfileNJ user", () => {
      expect(resolveSignedInUserId(profileNJClaims(RESIDENT_ID))).toEqual(RESIDENT_ID);
    });

    it("throws instead of falling back to sub when a ProfileNJ user has no resident ID", () => {
      expect(() => resolveSignedInUserId(profileNJClaims())).toThrow(MissingResidentIdError);
    });

    it("throws when a ProfileNJ user's resident ID is empty", () => {
      expect(() => resolveSignedInUserId(profileNJClaims(""))).toThrow(MissingResidentIdError);
    });

    it("returns sub when there are no federated identities", () => {
      expect(resolveSignedInUserId({ sub: "cognito-sub" })).toEqual("cognito-sub");
    });

    it("returns sub for an identity from an unknown provider", () => {
      const claims: SignedInUserClaims = {
        sub: "cognito-sub",
        identities: [{ providerName: "SomethingElse", userId: "other-1" }],
      };
      expect(resolveSignedInUserId(claims)).toEqual("cognito-sub");
    });
  });

  describe("getSignInProvider", () => {
    it("returns myNJ for a myNJ user", () => {
      expect(getSignInProvider(myNJClaims)).toEqual("myNJ");
    });

    it("returns ProfileNJ for a ProfileNJ user", () => {
      expect(getSignInProvider(profileNJClaims(RESIDENT_ID))).toEqual("ProfileNJ");
    });

    it("returns undefined when there are no federated identities", () => {
      expect(getSignInProvider({ sub: "cognito-sub" })).toBeUndefined();
    });
  });
});
