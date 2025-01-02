/* eslint-disable no-undef */
import "@testing-library/jest-dom";
import React from "react";
import { TextDecoder, TextEncoder } from "util";
import { vi } from "vitest";

global.React = React;

process.env.API_BASE_URL = "";
process.env.REDIRECT_URL = "http://www.example.com";

global.scrollTo = vi.fn();
global.gtag = vi.fn();

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

global.console.warn = (message) => {
  throw new Error(message);
};

global.console.error = (message) => {
  throw new Error(message);
};

window.gtm = vi.fn();

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    };
  };

vi.mock("next/router", () => require("next-router-mock"));
