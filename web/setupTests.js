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
  throw message;
};
global.console.error = (message) => {
  throw message;
};

jest.setTimeout(10000);
