const { getConsoleOutput } = require("@jest/console");
const { DefaultReporter } = require("@jest/reporters");
const { utils } = require("@jest/reporters");

// This Jest reporter does not output any console.log except when the tests are
// failing, see: https://github.com/mozilla/addons-frontend/issues/2980.
class FingersCrossedReporter extends DefaultReporter {
  printTestFileHeader(testPath, config, result) {
    this.log(utils.getResultHeader(result, this._globalConfig, config));

    const consoleBuffer = result.console;
    const testFailed = result.numFailingTests > 0;

    if (testFailed && consoleBuffer && consoleBuffer.length > 0) {
      // prettier-ignore
      this.log(
        `  Console\n\n${getConsoleOutput(
          consoleBuffer,
          config,
          this._globalConfig,
        )}`
      );
    }
  }
}

module.exports = FingersCrossedReporter;
