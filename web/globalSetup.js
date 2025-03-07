/* eslint-disable no-undef */
// require("@testing-library/jest-dom");
import seedrandom from "seedrandom";

export default () => {
  const randomSeed = "1741298494986";
  // const randomSeed = Date.now().toString();b
  // console.log(expect.getState().currentTestName);
  let message = `Random seed: ${randomSeed}`;
  if (process.env.CIRCLE_NODE_INDEX) {
    message += `${Number(process.env.CIRCLE_NODE_INDEX) + 1}/${process.env.CIRCLE_NODE_TOTAL}`;
  }
  console.log(message);
  seedrandom(randomSeed, { global: true });
};

// make an actual random string, then log and seed using that

// console.log(`Shard (unit tests): (${process.env.CIRCLE_NODE_INDEX} + 1)/${process.env.CIRCLE_NODE_TOTAL}`);
