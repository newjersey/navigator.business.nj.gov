import { hashPII } from "@libs/piiHashFactory";
// import { createHash } from "node:crypto";
import * as crypto from "node:crypto";

describe("hashPII", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("hashes the PII with the salt using SHA3-512", async () => {
    process.env.PII_HASH_SALT = "test-salt";
    const pii = "123456789";
    const expectedHash = crypto
      .pbkdf2Sync(pii, "test-salt", 100000, 64, "sha3-512")
      .toString("hex");
    const hash = await hashPII(pii);
    expect(hash).toBe(expectedHash);
  });

  it("throws if no PII is provided", async () => {
    process.env.PII_HASH_SALT = "test-salt";
    await expect(hashPII("")).rejects.toThrow("PII is required");
  });

  it("throws if PII_HASH_SALT is not set", async () => {
    delete process.env.PII_HASH_SALT;
    await expect(hashPII("123456789")).rejects.toThrow(
      "PII_HASH_SALT environment variable is not set",
    );
  });
});
