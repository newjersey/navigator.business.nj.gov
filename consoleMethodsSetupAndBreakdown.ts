// @ts-nocheck
const originalConsoleMethods = {};

const methodsToIntercept = [
  "log",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "dir",
  "dirxml",
  "group",
  "groupCollapsed",
  "groupEnd",
  "time",
  "timeEnd",
  "timeLog",
  "assert",
  "clear",
  "count",
  "countReset",
  "table",
  "profile",
  "profileEnd",
];

export const throwErrorOnConsoleMethods = () => {
  for (const method of methodsToIntercept) {
    originalConsoleMethods[method] = console[method];
    console[method] = (...args) => {
      originalConsoleMethods[method].apply(console, args);
      throw new Error(`Unexpected call to console.${method}`);
    };
  }
};

export const restoreConsoleMethods = () => {
  for (const method of methodsToIntercept) {
    console[method] = originalConsoleMethods[method];
  }
};
