import { chooseCanonicalAccount } from "@domain/auth/chooseCanonicalAccount";
import { generateUser, generateUserData } from "@shared/test";
import { UserData } from "@shared/userData";

const withClaim = (userData: UserData, claimedISO: string): UserData => ({
  ...userData,
  user: { ...userData.user, emailSignInClaimedISO: claimedISO },
});

const withBusinessCount = (userData: UserData, count: number): UserData => {
  const businesses = Object.fromEntries(
    Array.from({ length: count }, (_, index) => {
      const id = `business-${index}`;
      return [id, { ...Object.values(userData.businesses)[0], id, dateDeletedISO: "" }];
    }),
  );
  return { ...userData, businesses, currentBusinessId: Object.keys(businesses)[0] };
};

describe("chooseCanonicalAccount", () => {
  it("returns undefined for no candidates", () => {
    expect(chooseCanonicalAccount([])).toBeUndefined();
  });

  it("returns the only candidate", () => {
    const only = generateUserData({});
    expect(chooseCanonicalAccount([only])).toEqual(only);
  });

  it("prefers a claimed account even when a sibling is more recent", () => {
    const claimed = withClaim(
      generateUserData({
        user: generateUser({ id: "aaa" }),
        lastUpdatedISO: "2020-01-01T00:00:00.000Z",
      }),
      "2020-06-01T00:00:00.000Z",
    );
    const recent = generateUserData({
      user: generateUser({ id: "bbb" }),
      lastUpdatedISO: "2026-01-01T00:00:00.000Z",
    });

    expect(chooseCanonicalAccount([recent, claimed])?.user.id).toBe("aaa");
  });

  it("prefers the earliest claim when two accounts are claimed", () => {
    const first = withClaim(
      generateUserData({ user: generateUser({ id: "aaa" }) }),
      "2020-01-01T00:00:00.000Z",
    );
    const second = withClaim(
      generateUserData({ user: generateUser({ id: "bbb" }) }),
      "2021-01-01T00:00:00.000Z",
    );

    expect(chooseCanonicalAccount([second, first])?.user.id).toBe("aaa");
  });

  it("falls back to the most recently updated account", () => {
    const older = generateUserData({
      user: generateUser({ id: "aaa" }),
      lastUpdatedISO: "2024-01-01T00:00:00.000Z",
    });
    const newer = generateUserData({
      user: generateUser({ id: "bbb" }),
      lastUpdatedISO: "2026-01-01T00:00:00.000Z",
    });

    expect(chooseCanonicalAccount([older, newer])?.user.id).toBe("bbb");
  });

  it("treats a missing or unparseable timestamp as least recent", () => {
    const broken = generateUserData({
      user: generateUser({ id: "aaa" }),
      lastUpdatedISO: "not-a-date",
    });
    const valid = generateUserData({
      user: generateUser({ id: "bbb" }),
      lastUpdatedISO: "2020-01-01T00:00:00.000Z",
    });

    expect(chooseCanonicalAccount([broken, valid])?.user.id).toBe("bbb");
  });

  it("breaks a timestamp tie on the most non-deleted businesses", () => {
    const sameISO = "2026-01-01T00:00:00.000Z";
    const one = generateUserData({ user: generateUser({ id: "aaa" }), lastUpdatedISO: sameISO });
    const three = withBusinessCount(
      generateUserData({ user: generateUser({ id: "bbb" }), lastUpdatedISO: sameISO }),
      3,
    );

    expect(chooseCanonicalAccount([one, three])?.user.id).toBe("bbb");
  });

  it("does not count deleted businesses", () => {
    const sameISO = "2026-01-01T00:00:00.000Z";
    const live = generateUserData({ user: generateUser({ id: "aaa" }), lastUpdatedISO: sameISO });
    const threeDeleted = withBusinessCount(
      generateUserData({ user: generateUser({ id: "bbb" }), lastUpdatedISO: sameISO }),
      3,
    );
    const allDeleted = {
      ...threeDeleted,
      businesses: Object.fromEntries(
        Object.entries(threeDeleted.businesses).map(([id, business]) => [
          id,
          { ...business, dateDeletedISO: "2026-02-01T00:00:00.000Z" },
        ]),
      ),
    };

    expect(chooseCanonicalAccount([live, allDeleted])?.user.id).toBe("aaa");
  });

  it("breaks a full tie on the lowest user id, independent of input order", () => {
    const sameISO = "2026-01-01T00:00:00.000Z";
    const a = generateUserData({ user: generateUser({ id: "aaa" }), lastUpdatedISO: sameISO });
    const b = generateUserData({ user: generateUser({ id: "bbb" }), lastUpdatedISO: sameISO });

    expect(chooseCanonicalAccount([a, b])?.user.id).toBe("aaa");
    expect(chooseCanonicalAccount([b, a])?.user.id).toBe("aaa");
  });
});
