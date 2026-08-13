import { resolveForeignEnvironmentPolicy } from "@functions/config";

describe("resolveForeignEnvironmentPolicy", () => {
  it.each([
    [{ stage: "local", cryptoContextStage: "local" }, undefined],
    [{ stage: "dev", cryptoContextStage: "" }, undefined],
    [{ stage: "dev", cryptoContextStage: "dev" }, "reset"],
    [{ stage: "testing", cryptoContextStage: "dev" }, "reset"],
    [{ stage: "content", cryptoContextStage: "dev" }, "reset"],
    [{ stage: "staging", cryptoContextStage: "staging" }, "reset"],
    [{ stage: "dev", cryptoContextStage: "prod" }, undefined],
    [{ stage: "staging", cryptoContextStage: "deev" }, undefined],
    [{ stage: "unknown", cryptoContextStage: "unknown" }, undefined],
    [{ stage: "prod", cryptoContextStage: "prod" }, "quarantine"],
    [{ stage: "prod", cryptoContextStage: "dev" }, "quarantine"],
  ] as const)("resolves %p to %p", (config, expected) => {
    expect(resolveForeignEnvironmentPolicy(config)).toBe(expected);
  });
});
