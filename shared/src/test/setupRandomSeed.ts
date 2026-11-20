import { randomBytes } from "node:crypto";
import { createSeededRandom } from "./createSeededRandom";

type TestGlobalThis = {
  testRandomSeeds: Map<string, string>;
};

beforeEach(() => {
  const currentTestName = expect.getState().currentTestName;
  if (currentTestName === undefined) {
    throw new Error("expect.getState().currentTestName is undefined");
  }
  if ((global as unknown as TestGlobalThis).testRandomSeeds.has(currentTestName)) {
    throw new Error(
      `Unexpected duplicate test name "${currentTestName}" at ${
        expect.getState().testPath
      }. Please make test names unique.`,
    );
  }
  const randomSeed = process.env.RANDOM_SEED || randomBytes(32).toString("hex");
  (global as unknown as TestGlobalThis).testRandomSeeds.set(currentTestName, randomSeed);
  Math.random = createSeededRandom({ seed: randomSeed });
});
