import type { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import type { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateProfileData,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import type { UserData } from "@businessnjgovnavigator/shared/userData";
import { isLearnModeUser } from "@/lib/domain-logic/isLearnModeUser";

const generateLearnModeUserData = ({
  user,
  businessPersona = "STARTING",
}: {
  readonly user?: Partial<BusinessUser>;
  readonly businessPersona?: BusinessPersona;
} = {}): UserData => {
  return generateUserDataForBusiness(
    generateBusiness({ profileData: generateProfileData({ businessPersona }) }),
    { user: generateUser({ onboardedAsLearningUser: true, ...user }) },
  );
};

describe("isLearnModeUser", () => {
  const originalFlag = process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW;

  beforeEach(() => {
    process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW = "true";
  });

  afterAll(() => {
    process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW = originalFlag;
  });

  it("returns true for a starting guest who onboarded as a learning user", () => {
    expect(isLearnModeUser(generateLearnModeUserData())).toBe(true);
  });

  it("returns false when the intent selection flow is disabled", () => {
    process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW = "false";
    expect(isLearnModeUser(generateLearnModeUserData())).toBe(false);
  });

  it("returns false when user data is undefined", () => {
    expect(isLearnModeUser(undefined)).toBe(false);
  });

  it("returns false when the user did not onboard as a learning user", () => {
    expect(
      isLearnModeUser(generateLearnModeUserData({ user: { onboardedAsLearningUser: false } })),
    ).toBe(false);
    expect(
      isLearnModeUser(generateLearnModeUserData({ user: { onboardedAsLearningUser: undefined } })),
    ).toBe(false);
  });

  it("returns false when the user has a myNJ account", () => {
    expect(isLearnModeUser(generateLearnModeUserData({ user: { myNJUserKey: "some-key" } }))).toBe(
      false,
    );
  });

  it("returns false when the business persona is not STARTING", () => {
    expect(isLearnModeUser(generateLearnModeUserData({ businessPersona: "OWNING" }))).toBe(false);
  });
});
