/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AWSCrypto from "@aws-crypto/client-node";
import { AwsPiiHashFactory } from "@client/AwsPiiHashFactory";
import { PiiHashClient } from "@domain/types";
import { randomInt } from "@shared/intHelpers";


type AWSMockContext = {
  stage: string;
  purpose: string;
  origin: string;
};

type MockAWSCryptoType = {
  encryptValueCalledWith: string;
  decryptValueCalledWith: string;
  optionsCalledWith: string;
  contextCalledWith: any;
  buildClient: (options: string) => {
    encrypt: (cmm: string, plaintext: string, op?: AWSMockContext) => Promise<any>;
    decrypt: (keyring: AWSCrypto.KeyringNode, value: string) => Promise<any>;
  };
  KmsKeyringNode: () => void;
  CommitmentPolicy: any;
};

type MockAWSBase64 = {
  fromBase64: (value: string) => string;
  toBase64: (value: string) => string;
};

const mockAWSCrypto = AWSCrypto as unknown as jest.Mocked<MockAWSCryptoType>;

jest.mock("@aws-crypto/client-node", (): MockAWSCryptoType => {
  return {
    encryptValueCalledWith: "",
    decryptValueCalledWith: "",
    optionsCalledWith: "",
    contextCalledWith: undefined,
    CommitmentPolicy: { REQUIRE_ENCRYPT_REQUIRE_DECRYPT: "REQUIRE_ENCRYPT_REQUIRE_DECRYPT" },
    buildClient: function MockBuildClient(options: string): any {
      this.optionsCalledWith = options;
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const encrypt = (cmm: string, plaintext: string, op?: AWSMockContext): any => {
        this.encryptValueCalledWith = plaintext;
        this.contextCalledWith = { ...op };
        return Promise.resolve(plaintext).then((): any => {
          return { result: plaintext, messeageHeader: "message-header" };
        });
      };
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const decrypt = (keyring: AWSCrypto.KeyringNode, value: string): any => {
        const encoder = new TextEncoder();
        this.decryptValueCalledWith = value;
        return Promise.resolve(value).then((): any => {
          return {
            plaintext: encoder.encode("decrypted-value"),
            messageHeader: {
              encryptionContext: {
                stage: "some-stage",
                purpose: "some-purpose",
                origin: "some-origin",
              },
            },
          };
        });
      };
      return { encrypt, decrypt };
    },
    KmsKeyringNode: function MockKeyRingNode(): any {},
  };
});

jest.mock("@aws-sdk/util-base64-node", (): MockAWSBase64 => {
  return {
    fromBase64: function mockFromBase64(value: string): string {
      return value;
    },
    toBase64: function mockToBase64(value: string): string {
      return value;
    },
  };
});

// Mock the AWS SDK v3 properly
// jest.mock("@aws-sdk/client-kms", () => ({
//   KMS: jest.fn().mockImplementation(() => ({
//     decrypt: mockDecrypt,
//   })),
// }));

describe("Secure PII Hashing", () => {
  let client: PiiHashClient;

  const testOptions = {
    applicationSalt: "test-application-salt",
    iterations: 1000, // Lower for faster tests
  };

  const fakeGeneratorKeyId = "random-arn";
  const fakeTaxID = `${randomInt(12)}`;

  beforeEach(() => {
    jest.clearAllMocks();

    client = AwsPiiHashFactory(fakeGeneratorKeyId, 1);
  });

  describe("hashValue", () => {
    it("should generate a hash for a valid sensitive string", async () => {
      const hash = await client.hashValue(fakeTaxID, testOptions);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(128); // SHA3-512 = 64 bytes = 128 hex chars
    });

    //   it("should generate the same hash for the same input (deterministic)", async () => {
    //     const hash1 = await createSecurePIIHash("123-45-6789", testOptions);
    //     const hash2 = await createSecurePIIHash("123-45-6789", testOptions);
    //     expect(hash1).toEqual(hash2);
    //   });

    //   it("should generate different hashes for different sensitive strings", async () => {
    //     const hash1 = await createSecurePIIHash("123-45-6789", testOptions);
    //     const hash2 = await createSecurePIIHash("987-65-4321", testOptions);
    //     expect(hash1).not.toEqual(hash2);
    //   });

    //   it("should normalize inputs by removing non-alphanumeric characters", async () => {
    //     const hash1 = await createSecurePIIHash("123-45-6789", testOptions);
    //     const hash2 = await createSecurePIIHash("123456789", testOptions);
    //     expect(hash1).toEqual(hash2);
    //   });

    //   it("should work with encrypted salts via options", async () => {
    //     const encryptedOptions = {
    //       applicationSalt: "encrypted-salt-base64",
    //       isEncryptedSalt: true,
    //       kmsKeyId: "alias/test-key",
    //       iterations: 1000,
    //     };

    //     const hash = await createSecurePIIHash("123-45-6789", encryptedOptions);

    //     // Verify our mock decrypt was called with expected parameters
    //     expect(mockDecrypt).toHaveBeenCalledWith({
    //       CiphertextBlob: expect.any(Buffer),
    //       KeyId: encryptedOptions.kmsKeyId,
    //     });

    //     expect(hash).toBeDefined();
    //   });

    //   it("should throw an error for empty or non-string input", async () => {
    //     await expect(createSecurePIIHash("", testOptions)).rejects.toThrow(
    //       "Sensitive data must be a non-empty string",
    //     );
    //     await expect(createSecurePIIHash(null as unknown as string, testOptions)).rejects.toThrow(
    //       "Sensitive data must be a non-empty string",
    //     );
    //     await expect(
    //       createSecurePIIHash(undefined as unknown as string, testOptions),
    //     ).rejects.toThrow("Sensitive data must be a non-empty string");
    //     await expect(createSecurePIIHash(123 as unknown as string, testOptions)).rejects.toThrow(
    //       "Sensitive data must be a non-empty string",
    //     );
    //   });

    //   it("should throw an error when using encrypted salt without a KMS Key ID", async () => {
    //     const encryptedOptions = {
    //       applicationSalt: "encrypted-salt-base64",
    //       isEncryptedSalt: true,
    //       // No kmsKeyId provided
    //     };

    //     await expect(createSecurePIIHash("123-45-6789", encryptedOptions)).rejects.toThrow(
    //       "KMS Key ID is required when using an encrypted salt",
    //     );
    //   });

    //   it("should use iterations from environment variable when available", async () => {
    //     // Set a specific value in the environment
    //     process.env.PII_HASH_ITERATIONS = "5000";

    //     // Spy on our wrapper instead of crypto directly
    //     const pbkdf2Spy = jest.spyOn(cryptoUtils, "pbkdf2");

    //     await createSecurePIIHash("123-45-6789", { applicationSalt: "test-salt" });

    //     // Check that the correct iterations value was passed to pbkdf2
    //     expect(pbkdf2Spy).toHaveBeenCalledWith(
    //       "123456789", // normalized input
    //       "test-salt",
    //       5000, // this should be the parsed value from the environment
    //       64,
    //       "sha3-512",
    //       expect.any(Function),
    //     );
    //   });

    //   it("should use default iterations (100000) when environment variable is not set", async () => {
    //     // Remove iterations from environment
    //     delete process.env.PII_HASH_ITERATIONS;

    //     // Spy on our wrapper instead of crypto directly
    //     const pbkdf2Spy = jest.spyOn(cryptoUtils, "pbkdf2");

    //     await createSecurePIIHash("123-45-6789", { applicationSalt: "test-salt" });

    //     // Check that the default value was used
    //     expect(pbkdf2Spy).toHaveBeenCalledWith(
    //       "123456789", // normalized input
    //       "test-salt",
    //       100000, // default value should be used
    //       64,
    //       "sha3-512",
    //       expect.any(Function),
    //     );
    //   });

    //   it("should throw with proper error message when pbkdf2 throws an Error", async () => {
    //     // Mock the wrapper to throw an Error instance via the callback
    //     jest
    //       .spyOn(cryptoUtils, "pbkdf2")
    //       .mockImplementationOnce((_data, _salt, _iterations, _keylen, _digest, callback) => {
    //         callback(new Error("Specific error message"), Buffer.alloc(0));
    //         return;
    //       });

    //     await expect(createSecurePIIHash("123-45-6789", testOptions)).rejects.toThrow(
    //       "Hash generation failed: Specific error message",
    //     );
    //   });

    //   it("should throw with 'Unknown error' when pbkdf2 throws a non-Error", async () => {
    //     // Mock the wrapper to throw a string (not an Error instance)
    //     jest
    //       .spyOn(cryptoUtils, "pbkdf2")
    //       .mockImplementationOnce((_data, _salt, _iterations, _keylen, _digest, callback) => {
    //         callback("Not an error object" as unknown as Error, Buffer.alloc(0));
    //         return;
    //       });

    //     await expect(createSecurePIIHash("123-45-6789", testOptions)).rejects.toThrow(
    //       "Hash generation failed: Unknown error",
    //     );
    //   });

    //   it("should throw with error message when KMS decryption throws an Error", async () => {
    //     // Mock decrypt to reject with an Error instance
    //     mockDecrypt.mockRejectedValueOnce(new Error("Specific KMS error"));

    //     const encryptedOptions = {
    //       applicationSalt: "encrypted-salt-base64",
    //       isEncryptedSalt: true,
    //       kmsKeyId: "alias/test-key",
    //     };

    //     await expect(createSecurePIIHash("123-45-6789", encryptedOptions)).rejects.toThrow(
    //       "Failed to decrypt salt with KMS: Specific KMS error",
    //     );
    //   });

    //   it("should throw with 'Unknown error' when KMS decryption throws a non-Error", async () => {
    //     // Mock decrypt to reject with a string (not an Error instance)
    //     mockDecrypt.mockRejectedValueOnce("Not an error object");

    //     const encryptedOptions = {
    //       applicationSalt: "encrypted-salt-base64",
    //       isEncryptedSalt: true,
    //       kmsKeyId: "alias/test-key",
    //     };

    //     await expect(createSecurePIIHash("123-45-6789", encryptedOptions)).rejects.toThrow(
    //       "Failed to decrypt salt with KMS: Unknown error",
    //     );
    //   });

    //   it("should throw an error when KMS decryption returns empty plaintext", async () => {
    //     // Mock decrypt to return empty plaintext
    //     mockDecrypt.mockResolvedValueOnce({ Plaintext: null });

    //     const encryptedOptions = {
    //       applicationSalt: "encrypted-salt-base64",
    //       isEncryptedSalt: true,
    //       kmsKeyId: "alias/test-key",
    //     };

    //     await expect(createSecurePIIHash("123-45-6789", encryptedOptions)).rejects.toThrow(
    //       "KMS decryption returned empty plaintext",
    //     );
    //   });

    //   it("should handle legacy function names for backward compatibility", async () => {
    //     const hash1 = await createSecurePIIHash("123-45-6789", testOptions);
    //     const hash2 = await createSecureSSNHash("123-45-6789", testOptions);
    //     expect(hash1).toEqual(hash2);
    //   });
    // });

    // describe("hashPII", () => {
    //   it("should use environment variables and generate a hash", async () => {
    //     const hash = await hashPII("123-45-6789");
    //     expect(hash).toBeDefined();
    //     expect(typeof hash).toBe("string");
    //   });

    //   it("should throw an error if required environment variables are missing", async () => {
    //     delete process.env.PII_HASH_SALT;
    //     await expect(hashPII("123-45-6789")).rejects.toThrow(/PII_HASH_SALT/);
    //   });

    //   it("should handle encrypted salts from environment variables", async () => {
    //     process.env.PII_HASH_SALT = "encrypted-salt-base64";
    //     process.env.PII_HASH_SALT_ENCRYPTED = "true";
    //     process.env.PII_HASH_KMS_KEY_ID = "alias/test-key";

    //     await hashPII("123-45-6789");

    //     // Verify our mock decrypt was called
    //     expect(mockDecrypt).toHaveBeenCalled();
    //   });

    //   it("should maintain backward compatibility with hashSSN", async () => {
    //     const hash1 = await hashPII("123-45-6789");
    //     const hash2 = await hashSSN("123-45-6789");
    //     expect(hash1).toEqual(hash2);
    //   });
  });
});
