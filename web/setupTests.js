/* eslint-disable functional/immutable-data */
/* eslint-disable no-undef */
require("@testing-library/jest-dom");

process.env.API_BASE_URL = "";
process.env.REDIRECT_URL = "http://www.example.com";

global.scrollTo = jest.fn();
global.gtag = jest.fn();

global.console.warn = (message) => {
  throw message;
};
global.console.error = (message) => {
  throw message;
};

jest.setTimeout(10000);
