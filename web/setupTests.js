/* eslint-disable no-undef */
require("@testing-library/jest-dom");
import { TextDecoder, TextEncoder } from "util";
import { restoreConsoleMethods, throwErrorOnConsoleMethods } from "../consoleMethodsSetupAndBreakdown";

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

beforeEach(() => {
  throwErrorOnConsoleMethods();
});

afterEach(() => {
  restoreConsoleMethods();
});
