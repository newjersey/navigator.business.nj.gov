import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { generateProfileData, generateUserData, randomInt } from "@businessnjgovnavigator/shared/";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("useContentModifiedByUserData", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("${oos} keyword", () => {
    it("renders out of state designation when businessPersona is Foreign", () => {
      useMockUserData(generateUserData({ profileData: generateProfileData({ businessPersona: "FOREIGN" }) }));
      const result = useContentModifiedByUserData("You have a ${oos} business");
      expect(result).toEqual(expect.stringContaining("out-of-state"));
    });

    it("does not render out of state designation when businessPersona is not Foreign", () => {
      useMockUserData(
        generateUserData({
          profileData: generateProfileData({ businessPersona: randomInt() % 2 ? "STARTING" : "OWNING" }),
        })
      );

      const result = useContentModifiedByUserData("You have a ${oos} business");
      expect(result).toEqual(expect.not.stringContaining("out-of-state"));
    });
  });

  describe("${OoS} keyword", () => {
    it("renders out of state designation when businessPersona is Foreign", () => {
      useMockUserData(generateUserData({ profileData: generateProfileData({ businessPersona: "FOREIGN" }) }));
      const result = useContentModifiedByUserData("You have a ${OoS} business");
      expect(result).toEqual(expect.stringContaining("Out-of-State"));
    });

    it("does not render out of state designation when businessPersona is not Foreign", () => {
      useMockUserData(
        generateUserData({
          profileData: generateProfileData({ businessPersona: randomInt() % 2 ? "STARTING" : "OWNING" }),
        })
      );

      const result = useContentModifiedByUserData("You have a ${OoS} business");
      expect(result).toEqual(expect.not.stringContaining("Out-of-State"));
    });
  });
});
