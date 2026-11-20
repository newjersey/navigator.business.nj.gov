import { randomElementFromArray } from "@businessnjgovnavigator/shared/arrayHelpers";
import { randomInt, randomIntFromInterval } from "@businessnjgovnavigator/shared/intHelpers";
import { createSeededRandom } from "@businessnjgovnavigator/shared/test/createSeededRandom";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test/formationFactories";

const generateRandomValues = () => ({
  integer: randomInt(),
  largeInteger: randomInt(15),
  interval: randomIntFromInterval("1", "10"),
  element: randomElementFromArray(["first", "second", "third"]),
  municipality: generateMunicipality({}),
});

it("replays the installed test seed through helpers and a factory", () => {
  const testName = expect.getState().currentTestName;
  const seeds = (global as unknown as { testRandomSeeds: Map<string, string> }).testRandomSeeds;
  const seed = testName === undefined ? undefined : seeds.get(testName);
  expect(seed).toBeDefined();
  if (seed === undefined) {
    throw new Error("Test seed was not recorded");
  }
  if (process.env.RANDOM_SEED) {
    expect(seed).toBe(process.env.RANDOM_SEED);
  } else {
    expect(seed).toMatch(/^[a-f0-9]{64}$/);
  }

  const installedRandom = Math.random;
  try {
    const original = generateRandomValues();
    Math.random = createSeededRandom({ seed });
    expect(generateRandomValues()).toEqual(original);
  } finally {
    Math.random = installedRandom;
  }
});
