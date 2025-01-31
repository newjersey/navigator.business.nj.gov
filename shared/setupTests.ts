import { restoreConsoleMethods, throwErrorOnConsoleMethods } from "../consoleMethodsSetupAndBreakdown";

beforeEach(() => {
  throwErrorOnConsoleMethods();
});

afterEach(() => {
  restoreConsoleMethods();
});
