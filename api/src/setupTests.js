/* eslint-disable no-undef */
const seedrandom = require("seedrandom");
// require("seedrandom");
// import seedrandom from "seedrandom";

beforeEach(function () {
  seedrandom(process.env.RANDOM_SEED, { global: true });

  // if (expect.getState().currentTestName.includes("[logRandomSeed]")) {
  // let message = `Random seed: ${process.env.TESTING_SEED} ${
  //   process.env.CIRCLE_NODE_INDEX
  //     ? `${Number(process.env.CIRCLE_NODE_INDEX) + 1}/${process.env.CIRCLE_NODE_TOTAL} `
  //     : ""
  // }(${expect.getState().currentTestName})`;
  // console.log(message);
  // }
});
