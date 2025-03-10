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
