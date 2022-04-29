import { decideABExperience } from "./businessUser";

describe("businessUser", () => {
  describe("decideABExperience", () => {
    let mathRandom: jest.SpyInstance;

    beforeEach(() => {
      // eslint-disable-next-line functional/immutable-data
      delete process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE;
      mathRandom = jest.spyOn(global.Math, "random");
    });

    afterEach(() => {
      // eslint-disable-next-line functional/immutable-data
      delete process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE;
      mathRandom.mockRestore();
    });

    it("always returns ExperienceA when B_Percentage is 0", () => {
      // eslint-disable-next-line functional/immutable-data
      process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE = "0";

      mathRandom.mockReturnValue(0);
      expect(decideABExperience()).toEqual("ExperienceA");

      mathRandom.mockReturnValue(0.9999);
      expect(decideABExperience()).toEqual("ExperienceA");

      mathRandom.mockReturnValue(0.5);
      expect(decideABExperience()).toEqual("ExperienceA");
    });

    it("always returns ExperienceB when B_Percentage is 100", () => {
      // eslint-disable-next-line functional/immutable-data
      process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE = "100";

      mathRandom.mockReturnValue(0);
      expect(decideABExperience()).toEqual("ExperienceB");

      mathRandom.mockReturnValue(0.9999);
      expect(decideABExperience()).toEqual("ExperienceB");

      mathRandom.mockReturnValue(0.5);
      expect(decideABExperience()).toEqual("ExperienceB");
    });

    it("returns ExperienceA random number is greater than percentage", () => {
      // eslint-disable-next-line functional/immutable-data
      process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE = "50";

      mathRandom.mockReturnValue(0);
      expect(decideABExperience()).toEqual("ExperienceB");

      mathRandom.mockReturnValue(0.9999);
      expect(decideABExperience()).toEqual("ExperienceA");

      mathRandom.mockReturnValue(0.51);
      expect(decideABExperience()).toEqual("ExperienceA");
    });
  });
});
