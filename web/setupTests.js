/* eslint-disable no-undef */
require("@testing-library/jest-dom");
import { TextDecoder, TextEncoder } from "util";

process.env.API_BASE_URL = "";
process.env.REDIRECT_URL = "http://www.example.com";

global.scrollTo = jest.fn();
global.gtag = jest.fn();

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.console.warn = (message) => {
  // Suppress known deprecation warnings from libraries during Next.js v16 migration
  const suppressedWarnings = ["findDOMNode is deprecated", "ReactDOMTestUtils.act is deprecated"];

  if (suppressedWarnings.some((warning) => message.includes?.(warning))) {
    return;
  }

  throw message;
};

global.console.error = (message) => {
  // Suppress known deprecation warnings from libraries during Next.js v16 migration
  const suppressedErrors = [
    "findDOMNode is deprecated",
    "ReactDOMTestUtils.act is deprecated",
    'Warning: A props object containing a "key" prop is being spread',
  ];

  if (suppressedErrors.some((error) => message.includes?.(error))) {
    return;
  }

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
