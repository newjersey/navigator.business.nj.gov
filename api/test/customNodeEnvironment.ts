import type { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";
import { Circus } from "@jest/types";
import NodeEnvironment from "jest-environment-node";

class CustomTestEnvironment extends NodeEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.global.testRandomSeeds = new Map<string, string>();
  }

  async handleTestEvent(event: Circus.Event): Promise<void> {
    if (event.name === "hook_failure" || event.name === "test_fn_failure") {
      const testRandomSeeds = this.global.testRandomSeeds as Map<string, string>;
      const currentTestName = this.context?.expect.getState().currentTestName;
      console.log(
        `Test failed, reproduce randomness by running with RANDOM_SEED=${testRandomSeeds.get(
          currentTestName
        )} (${currentTestName})`
      );
    }
  }
}

export default CustomTestEnvironment;
