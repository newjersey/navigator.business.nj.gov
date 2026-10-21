import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { hasNavigatorAccount } from "@/lib/auth/hasNavigatorAccount";
import { generateUser } from "@businessnjgovnavigator/shared/test";

describe("hasNavigatorAccount", () => {
  const originalFlag = process.env.FEATURE_PROFILE_NJ_LOGIN;

  beforeEach(() => {
    process.env.FEATURE_PROFILE_NJ_LOGIN = "true";
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.FEATURE_PROFILE_NJ_LOGIN;
    } else {
      process.env.FEATURE_PROFILE_NJ_LOGIN = originalFlag;
    }
  });

  it("ignores the session when the ProfileNJ flag is off, so myNJ behavior is unchanged", () => {
    process.env.FEATURE_PROFILE_NJ_LOGIN = "false";
    const user = generateUser({ myNJUserKey: undefined });
    expect(hasNavigatorAccount(user, IsAuthenticated.TRUE)).toBe(false);
  });

  it("is true for a user with a myNJ key, even when not signed in", () => {
    const user = generateUser({ myNJUserKey: "some-key" });
    expect(hasNavigatorAccount(user, IsAuthenticated.FALSE)).toBe(true);
  });

  it("is true for a signed-in user without a myNJ key", () => {
    const user = generateUser({ myNJUserKey: undefined });
    expect(hasNavigatorAccount(user, IsAuthenticated.TRUE)).toBe(true);
  });

  it("is false for a guest without a myNJ key", () => {
    const user = generateUser({ myNJUserKey: undefined });
    expect(hasNavigatorAccount(user, IsAuthenticated.FALSE)).toBe(false);
  });

  it("is false when there is no user and no session", () => {
    expect(hasNavigatorAccount(undefined, IsAuthenticated.FALSE)).toBe(false);
  });
});
