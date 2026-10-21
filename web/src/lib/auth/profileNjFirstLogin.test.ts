import {
  generateBusiness,
  generateUser,
  generateUserData,
} from "@businessnjgovnavigator/shared/test";
import type { UserData } from "@businessnjgovnavigator/shared/userData";
import type { ActiveUser } from "@/lib/auth/AuthContext";
import {
  createProfileNJUserData,
  ensureProfileNJUserRecord,
  type ProfileNJFirstLoginDependencies,
} from "@/lib/auth/profileNjFirstLogin";

const RESIDENT_ID = "r-1";

const guestWithAbandonedMyNJSignup = (): UserData => {
  const first = generateBusiness({ id: "biz-1", userId: "guest-id" });
  const second = generateBusiness({ id: "biz-2", userId: "guest-id" });
  return generateUserData({
    user: generateUser({ id: "guest-id", myNJUserKey: "old-key", email: "typed@example.com" }),
    currentBusinessId: "biz-1",
    businesses: { "biz-1": first, "biz-2": second },
  });
};

const profileNJUser: ActiveUser = {
  id: RESIDENT_ID,
  email: "Jane@Example.com",
  signInProvider: "ProfileNJ",
};

describe("profileNjFirstLogin", () => {
  describe("createProfileNJUserData", () => {
    it("re-keys guest data to the resident ID and drops myNJ leftovers", () => {
      const guest = guestWithAbandonedMyNJSignup();

      const result = createProfileNJUserData({
        guestUserData: guest,
        residentId: RESIDENT_ID,
        email: " Jane@Example.COM ",
      });

      expect(result.user.id).toEqual(RESIDENT_ID);
      expect(result.user.email).toEqual("jane@example.com");
      expect(result.user).not.toHaveProperty("myNJUserKey");
      for (const business of Object.values(result.businesses)) {
        expect(business.userId).toEqual(RESIDENT_ID);
      }
      expect(result.businesses["biz-1"].profileData).toEqual(guest.businesses["biz-1"].profileData);
      expect(result.businesses["biz-2"].profileData).toEqual(guest.businesses["biz-2"].profileData);
    });

    it("creates an empty, unstarted user when there is no guest data", () => {
      const result = createProfileNJUserData({
        guestUserData: undefined,
        residentId: RESIDENT_ID,
        email: "jane@example.com",
      });

      expect(result.user.id).toEqual(RESIDENT_ID);
      expect(result.user.email).toEqual("jane@example.com");
      const businesses = Object.values(result.businesses);
      expect(businesses).toHaveLength(1);
      expect(businesses[0].userId).toEqual(RESIDENT_ID);
      expect(businesses[0].onboardingFormProgress).toEqual("UNSTARTED");
    });
  });

  describe("ensureProfileNJUserRecord", () => {
    const createDependencies = (
      overrides: Partial<ProfileNJFirstLoginDependencies> = {},
    ): jest.Mocked<ProfileNJFirstLoginDependencies> => {
      return {
        getUserData: jest.fn().mockResolvedValue(generateUserData({})),
        postUserData: jest.fn().mockImplementation((userData) => Promise.resolve(userData)),
        getGuestUserData: jest.fn().mockReturnValue(undefined),
        ...overrides,
      } as jest.Mocked<ProfileNJFirstLoginDependencies>;
    };

    it("does nothing for a myNJ user", async () => {
      const dependencies = createDependencies();

      await ensureProfileNJUserRecord({ ...profileNJUser, signInProvider: "myNJ" }, dependencies);

      expect(dependencies.getUserData).not.toHaveBeenCalled();
      expect(dependencies.postUserData).not.toHaveBeenCalled();
    });

    it("does nothing when the sign-in provider is unknown", async () => {
      const dependencies = createDependencies();

      await ensureProfileNJUserRecord(
        { ...profileNJUser, signInProvider: undefined },
        dependencies,
      );

      expect(dependencies.getUserData).not.toHaveBeenCalled();
      expect(dependencies.postUserData).not.toHaveBeenCalled();
    });

    it("does not save when the ProfileNJ user already has a record", async () => {
      const dependencies = createDependencies();

      await ensureProfileNJUserRecord(profileNJUser, dependencies);

      expect(dependencies.getUserData).toHaveBeenCalledWith(RESIDENT_ID);
      expect(dependencies.postUserData).not.toHaveBeenCalled();
    });

    it("saves the guest data under the resident ID when the record is missing", async () => {
      const guest = guestWithAbandonedMyNJSignup();
      const dependencies = createDependencies({
        getUserData: jest.fn().mockRejectedValue(404),
        getGuestUserData: jest.fn().mockReturnValue(guest),
      });

      await ensureProfileNJUserRecord(profileNJUser, dependencies);

      expect(dependencies.postUserData).toHaveBeenCalledTimes(1);
      const saved = dependencies.postUserData.mock.calls[0][0];
      expect(saved).toEqual(
        createProfileNJUserData({
          guestUserData: guest,
          residentId: RESIDENT_ID,
          email: profileNJUser.email,
        }),
      );
    });

    it("rethrows other errors without saving", async () => {
      const dependencies = createDependencies({ getUserData: jest.fn().mockRejectedValue(500) });

      await expect(ensureProfileNJUserRecord(profileNJUser, dependencies)).rejects.toEqual(500);
      expect(dependencies.postUserData).not.toHaveBeenCalled();
    });
  });
});
