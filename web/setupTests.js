/* eslint-disable no-undef */
require("@testing-library/jest-dom");
import { TextDecoder, TextEncoder } from "util";

process.env.API_BASE_URL = "";
process.env.REDIRECT_URL = "http://www.example.com";
process.env.FEATURE_BUSINESS_FLP = "true";
process.env.FEATURE_LOGIN_PAGE = "true";
process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE = "true";
process.env.WEBFLOW_API_TOKEN = 12345678910;

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
