/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const dotenvPlugin = require("cypress-dotenv");
const { lighthouse, prepareAudit } = require("@cypress-audit/lighthouse");
const { pa11y } = require("@cypress-audit/pa11y");

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  on("before:browser:launch", (browser = {}, launchOptions) => {
    prepareAudit(launchOptions);
  });

  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("task", {
    lighthouse: lighthouse(),
    pa11y: pa11y(),
    log(message) {
      console.log(message);
      return null;
    },
  });

  config = dotenvPlugin(config);
  return config;
};
