import sharedConfig from "../jest.shared";

process.env = Object.assign(process.env, {
  SHOW_DISABLED_INDUSTRIES: "false",
  USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH: "false",
});

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  displayName: "shared",
  rootDir: "src",
};
