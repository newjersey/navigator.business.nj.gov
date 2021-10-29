/* eslint-disable no-undef */
require("@testing-library/jest-dom");

process.env.API_BASE_URL = "";

global.scrollTo = jest.fn();
global.gtag = jest.fn();

global.console.warn = (message) => {
  throw message;
};
global.console.error = (message) => {
  throw message;
};
