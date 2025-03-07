/* eslint-disable no-undef */
require("seedrandom");
// import seedrandom from "seedrandom";

beforeEach(function () {
  let randomSeed = Date.now().toString();
  if (process.env.RANDOM_SEED) {
    randomSeed = process.env.RANDOM_SEED;
  }
  seedrandom(randomSeed, { global: true });
  if (expect.getState().currentTestName.includes("[logRandomSeed]")) {
    let message = `Random seed: ${randomSeed}`;
    if (process.env.CIRCLE_NODE_INDEX) {
      message += `${Number(process.env.CIRCLE_NODE_INDEX) + 1}/${process.env.CIRCLE_NODE_TOTAL}`;
    }
    message += ` (${expect.getState().currentTestName})`;
    console.log(message);
  }
});
