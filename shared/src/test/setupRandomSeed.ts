import seedrandom from "seedrandom";

type TestGlobalThis = {
  testRandomSeeds: Map<string, string>;
};

beforeEach(function () {
  const currentTestName = expect.getState().currentTestName;
  if (currentTestName === undefined) {
    throw new Error("expect.getState().currentTestName is undefined");
  }
  if ((global as unknown as TestGlobalThis).testRandomSeeds.has(currentTestName)) {
    throw new Error(
      `Unexpected duplicate test name "${currentTestName}" at ${
        expect.getState().testPath
      }. Please make test names unique.`
    );
  }
  const randomSeed = process.env.RANDOM_SEED || Math.random().toString(36).slice(2);
  (global as unknown as TestGlobalThis).testRandomSeeds.set(currentTestName, randomSeed);
  seedrandom(randomSeed, { global: true });
});
