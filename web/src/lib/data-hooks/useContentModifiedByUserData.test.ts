import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";
import { useMockProfileData } from "@/test/mock/mockUseUserData";

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

describe("useContentModifiedByUserData", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("${oos} keyword", () => {
    it("renders out of state designation when businessPersona is FOREIGN", () => {
      useMockProfileData({ businessPersona: "FOREIGN" });

      const result = useContentModifiedByUserData("You have a ${oos} business");
      expect(result).toEqual(expect.stringContaining("out-of-state"));
      expect(result).toEqual("You have a out-of-state business");
    });

    it("does not render out of state designation when businessPersona is STARTING", () => {
      useMockProfileData({ businessPersona: "STARTING" });

      const result = useContentModifiedByUserData("You have a ${oos} business");
      expect(result).toEqual(expect.not.stringContaining("${oos}"));
      expect(result).toEqual(expect.not.stringContaining("out-of-state"));
      expect(result).toEqual("You have a business");
    });

    it("does not render out of state designation when businessPersona is OWNING", () => {
      useMockProfileData({ businessPersona: "OWNING" });

      const result = useContentModifiedByUserData("You have a ${oos} business");
      expect(result).toEqual(expect.not.stringContaining("${oos}"));
      expect(result).toEqual(expect.not.stringContaining("out-of-state"));
      expect(result).toEqual("You have a business");
    });

    it("does not render out of state designation when businessPersona is undefined", () => {
      useMockProfileData({ businessPersona: undefined });

      const result = useContentModifiedByUserData("You have a ${oos} business");
      expect(result).toEqual(expect.not.stringContaining("${oos}"));
      expect(result).toEqual(expect.not.stringContaining("out-of-state"));
      expect(result).toEqual("You have a business");
    });
  });

  describe("${OoS} keyword", () => {
    it("renders out of state designation when businessPersona is FOREIGN", () => {
      useMockProfileData({ businessPersona: "FOREIGN" });
      const result = useContentModifiedByUserData("You have a ${OoS} business");
      expect(result).toEqual(expect.stringContaining("Out-of-State"));
      expect(result).toEqual("You have a Out-of-State business");
    });

    it("does not render out of state designation when businessPersona is STARTING", () => {
      useMockProfileData({ businessPersona: "STARTING" });

      const result = useContentModifiedByUserData("You have a ${OoS} business");
      expect(result).toEqual(expect.not.stringContaining("${OoS}"));
      expect(result).toEqual(expect.not.stringContaining("Out-of-State"));
      expect(result).toEqual("You have a business");
    });

    it("does not render out of state designation when businessPersona is OWNING", () => {
      useMockProfileData({ businessPersona: "OWNING" });

      const result = useContentModifiedByUserData("You have a ${OoS} business");
      expect(result).toEqual(expect.not.stringContaining("${OoS}"));
      expect(result).toEqual(expect.not.stringContaining("Out-of-State"));
      expect(result).toEqual("You have a business");
    });

    it("does not render out of state designation when businessPersona is undefined", () => {
      useMockProfileData({ businessPersona: undefined });

      const result = useContentModifiedByUserData("You have a ${OoS} business");
      expect(result).toEqual(expect.not.stringContaining("${OoS}"));
      expect(result).toEqual(expect.not.stringContaining("Out-of-State"));
      expect(result).toEqual("You have a business");
    });
  });
});
