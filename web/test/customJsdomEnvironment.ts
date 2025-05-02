import type { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";
import { Circus } from "@jest/types";
import JSDOMEnvironment from "jest-environment-jsdom";

class CustomJSDOMEnvironment extends JSDOMEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.global.testRandomSeeds = new Map<string, string>();
  }

  async handleTestEvent(event: Circus.Event): Promise<void> {
    if (event.name === "hook_failure" || event.name === "test_fn_failure") {
      const testRandomSeeds = this.global.testRandomSeeds as Map<string, string>;
      const currentTestName = this.getVmContext()?.expect.getState().currentTestName;
      console.log(
        `Failed ${currentTestName}. Replicate Math.random() values by running with RANDOM_SEED=${testRandomSeeds.get(
          currentTestName,
        )}`,
      );
    }
  }
}

export default CustomJSDOMEnvironment;
