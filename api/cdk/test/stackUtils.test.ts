import { requireEnv } from "../lib/stackUtils";

describe("requireEnv", () => {
  const name = "STACK_UTILS_TEST_VARIABLE";

  afterEach(() => {
    delete process.env[name];
  });

  it("returns the variable's value when it is set", () => {
    process.env[name] = "some-value";
    expect(requireEnv(name)).toEqual("some-value");
  });

  it("throws with the variable's name when it is missing", () => {
    expect(() => requireEnv(name)).toThrow(`Missing required env var: ${name}`);
  });

  it("throws with the variable's name when it is blank", () => {
    process.env[name] = "  ";
    expect(() => requireEnv(name)).toThrow(`Missing required env var: ${name}`);
  });
});
