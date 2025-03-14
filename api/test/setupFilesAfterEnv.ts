import seedrandom from "seedrandom";

beforeEach(function () {
  const randomSeed = process.env.RANDOM_SEED || Math.random().toString(36).slice(2);
  // global.testRandomSeeds.set(expect.getState().currentTestName, randomSeed);
  seedrandom(randomSeed, { global: true });
});
