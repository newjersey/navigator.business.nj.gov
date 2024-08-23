import sharedConfig from "../jest.shared";

process.env = Object.assign(process.env, {
  SHOW_DISABLED_INDUSTRIES: "false",
});

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  displayName: "shared",
  rootDir: "src",
};
