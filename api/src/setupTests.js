/* eslint-disable no-undef */
const seedrandom = require("seedrandom");
// require("seedrandom");
// import seedrandom from "seedrandom";

beforeEach(function () {
  let randomSeed = process.env.RANDOM_SEED || Math.random().toString(36).slice(2);
  seedrandom(randomSeed, { global: true });

  if (expect.getState().currentTestName.includes("[logRandomSeed]")) {
    let message = `Random seed: ${randomSeed} ${
      process.env.CIRCLE_NODE_INDEX
        ? `${Number(process.env.CIRCLE_NODE_INDEX) + 1}/${process.env.CIRCLE_NODE_TOTAL} `
        : ""
    }(${expect.getState().currentTestName})`;
    console.log(message);
  }
});
