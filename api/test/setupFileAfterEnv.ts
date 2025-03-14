import "jest-dynalite/withDb";
import seedrandom from "seedrandom";

beforeEach(function () {
  const currentTestName = expect.getState().currentTestName;
  if (currentTestName === undefined) {
    throw new Error("expect.getState().currentTestName is undefined");
  }
  if (global.testRandomSeeds.has(currentTestName)) {
    throw new Error("Unexpected duplicate test name");
  }
  const randomSeed = process.env.RANDOM_SEED || Math.random().toString(36).slice(2);
  global.testRandomSeeds.set(currentTestName, randomSeed);
  seedrandom(randomSeed, { global: true });
});
