/* eslint-disable no-undef */
require("@testing-library/jest-dom");
import { TextDecoder, TextEncoder } from "util";

process.env.API_BASE_URL = "";
process.env.REDIRECT_URL = "http://www.example.com";

global.scrollTo = jest.fn();
global.gtag = jest.fn();

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// React 19 compatibility: MessageChannel polyfill for jsdom
// React 19 uses MessageChannel for scheduling state updates, so this must be functional
if (global.MessageChannel === undefined) {
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = {
        postMessage: (data) => {
          if (this.port2.onmessage) {
            // Use setImmediate to ensure async behavior, fallback to setTimeout(0)
            const schedule =
              typeof setImmediate === "undefined" ? (cb) => setTimeout(cb, 0) : setImmediate;
            schedule(() => {
              if (this.port2.onmessage) {
                this.port2.onmessage({ data });
              }
            });
          }
        },
        onmessage: null,
        close: () => {},
      };
      this.port2 = {
        postMessage: (data) => {
          if (this.port1.onmessage) {
            const schedule =
              typeof setImmediate === "undefined" ? (cb) => setTimeout(cb, 0) : setImmediate;
            schedule(() => {
              if (this.port1.onmessage) {
                this.port1.onmessage({ data });
              }
            });
          }
        },
        onmessage: null,
        close: () => {},
      };
    }
  };
}

window.gtm = jest.fn();

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      media: "",
      onchange: null,
      // Old API (deprecated but still used by some libraries)
      addListener: function () {},
      removeListener: function () {},
      // Modern API (required by React 19 / MUI)
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return true;
      },
    };
  };

// Increase timeout to 30 seconds to handle resource contention during parallel test execution
// This prevents intermittent failures when tests run slowly due to CPU/memory contention
jest.setTimeout(30000);

jest.mock("next/router", () => require("next-router-mock"));

// Global mock for useConfig to provide Config to all tests
// React 19: Return function directly without jest.fn() wrapper for compatibility
jest.mock("@/lib/data-hooks/useConfig", () => {
  return {
    useConfig: () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getMergedConfig } = require("@businessnjgovnavigator/shared/contexts");
      return { Config: getMergedConfig() };
    },
  };
});
