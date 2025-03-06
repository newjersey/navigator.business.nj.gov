/* eslint-disable no-undef */
require("@testing-library/jest-dom");
import seedrandom from "seedrandom";
import { TextDecoder, TextEncoder } from "util";

process.env.API_BASE_URL = "";
process.env.REDIRECT_URL = "http://www.example.com";

global.scrollTo = jest.fn();
global.gtag = jest.fn();

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.console.warn = (message) => {
  throw message;
};

global.console.error = (message) => {
  throw message;
};

// make an actual random string, then log and seed using that

console.log(`Shard (unit tests): (${process.env.CIRCLE_NODE_INDEX} + 1)/${process.env.CIRCLE_NODE_TOTAL}`);
const randomSeed = Date.now().toString();
console.log("Random seed:", randomSeed);
seedrandom(randomSeed, { global: true });

window.gtm = jest.fn();

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

jest.setTimeout(10000);

jest.mock("next/router", () => require("next-router-mock"));
