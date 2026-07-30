/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AWSCrypto from "@aws-crypto/client-node";
import { AWSCryptoFactory, cryptoUtils } from "@client/AwsCryptoFactory";
import { type CryptoClient } from "@domain/types";
import { TextEncoder } from "node:util";

type AWSMockContext = {
  stage: string;
  purpose: string;
  origin: string;
};

type MockAWSCryptoType = {
  encryptValueCalledWith: string;
  decryptValueCalledWith: string;
  encryptKeyringCalledWith: unknown;
  decryptKeyringCalledWith: unknown;
  decryptResult: {
    error?: Error;
    encryptionContext: AWSMockContext;
  };
  optionsCalledWith: string;
  contextCalledWith: any;
  buildClient: (options: string) => {
    encrypt: (cmm: string, plaintext: string, op?: AWSMockContext) => Promise<any>;
    decrypt: (keyring: AWSCrypto.KeyringNode, value: string) => Promise<any>;
  };
  KmsKeyringNode: jest.Mock;
  CommitmentPolicy: any;
};

type MockAWSBase64 = {
  fromBase64: (value: string) => string;
  toBase64: (value: string) => string;
};

const mockAWSCrypto = AWSCrypto as unknown as jest.Mocked<MockAWSCryptoType>;

describe("AWSCryptoFactory", () => {
  let client: CryptoClient;

  beforeEach(() => {
    jest.resetAllMocks();
    mockAWSCrypto.decryptResult.error = undefined;
    mockAWSCrypto.decryptResult.encryptionContext = {
      stage: "some-stage",
      purpose: "some-purpose",
      origin: "some-origin",
    };
    client = AWSCryptoFactory(
      "some-key",
      {
        stage: "some-stage",
        purpose: "some-purpose",
        origin: "some-origin",
      },
      "some-application-salt",
    );
  });

  describe("keyrings", () => {
    it("encrypts with only the current generator key", async () => {
      await client.encryptValue("2323232");

      expect(mockAWSCrypto.KmsKeyringNode.mock.calls[0][0]).toEqual({
        generatorKeyId: "some-key",
      });
      expect(mockAWSCrypto.encryptKeyringCalledWith).toBe(
        mockAWSCrypto.KmsKeyringNode.mock.instances[0],
      );
    });

    it("decrypts with a strict current and legacy key allowlist", async () => {
      const clientWithLegacyKey = AWSCryptoFactory(
        "current-key",
        {
          stage: "some-stage",
          purpose: "some-purpose",
          origin: "some-origin",
        },
        undefined,
        ["legacy-key"],
      );

      await clientWithLegacyKey.decryptValue("encrypted-value");

      expect(mockAWSCrypto.KmsKeyringNode.mock.calls[3][0]).toEqual({
        keyIds: ["current-key", "legacy-key"],
      });
      expect(mockAWSCrypto.decryptKeyringCalledWith).toBe(
        mockAWSCrypto.KmsKeyringNode.mock.instances[3],
      );
    });

    it("deduplicates configured decrypt keys", () => {
      AWSCryptoFactory(
        "current-key",
        {
          stage: "some-stage",
          purpose: "some-purpose",
          origin: "some-origin",
        },
        undefined,
        ["", "current-key", "legacy-key", "legacy-key"],
      );

      expect(mockAWSCrypto.KmsKeyringNode.mock.calls[3][0]).toEqual({
        keyIds: ["current-key", "legacy-key"],
      });
    });
  });

  it("calls encrypt with the correct value", async () => {
    const result = await client.encryptValue("2323232");
    expect(result).toEqual("2323232");
    expect(mockAWSCrypto.encryptValueCalledWith).toEqual("2323232");
    expect(mockAWSCrypto.contextCalledWith).toEqual({
      encryptionContext: {
        stage: "some-stage",
        purpose: "some-purpose",
        origin: "some-origin",
      },
    });
    expect(mockAWSCrypto.optionsCalledWith).toEqual("REQUIRE_ENCRYPT_REQUIRE_DECRYPT");
  });

  it("calls decrypt with the correct value", async () => {
    const result = await client.decryptValue("encrypted-value");
    expect(result).toEqual("decrypted-value");
    expect(mockAWSCrypto.decryptValueCalledWith).toEqual("encrypted-value");
  });

  it.each([
    ["an unsupported wrapping key", "unencryptedDataKey has not been set"],
    ["malformed ciphertext", "Invalid ciphertext"],
    ["missing KMS permissions", "AccessDeniedException"],
    ["KMS throttling after SDK retries", "ThrottlingException"],
    ["a KMS timeout after SDK retries", "TimeoutError"],
  ])("propagates %s failures", async (_description, message) => {
    mockAWSCrypto.decryptResult.error = new Error(message);

    await expect(client.decryptValue("encrypted-value")).rejects.toThrow(message);
  });

  it("rejects ciphertext with an unexpected encryption context", async () => {
    mockAWSCrypto.decryptResult.encryptionContext = {
      stage: "another-stage",
      purpose: "some-purpose",
      origin: "some-origin",
    };

    await expect(client.decryptValue("encrypted-value")).rejects.toThrow(
      "Encryption Context does not match expected values",
    );
  });

  it("accepts an explicitly configured decrypt-only encryption context", async () => {
    const clientWithLegacyContext = AWSCryptoFactory(
      "some-key",
      {
        stage: "some-stage",
        purpose: "some-purpose",
        origin: "some-origin",
      },
      undefined,
      [],
      [
        {
          stage: "",
          purpose: "some-purpose",
          origin: "",
        },
      ],
    );
    mockAWSCrypto.decryptResult.encryptionContext = {
      stage: "",
      purpose: "some-purpose",
      origin: "",
    };

    await expect(clientWithLegacyContext.decryptValue("encrypted-value")).resolves.toBe(
      "decrypted-value",
    );
  });

  it("requires every value in a decrypt-only encryption context to match", async () => {
    const clientWithLegacyContext = AWSCryptoFactory(
      "some-key",
      {
        stage: "some-stage",
        purpose: "some-purpose",
        origin: "some-origin",
      },
      undefined,
      [],
      [
        {
          stage: "",
          purpose: "some-purpose",
          origin: "",
        },
      ],
    );
    mockAWSCrypto.decryptResult.encryptionContext = {
      stage: "",
      purpose: "another-purpose",
      origin: "",
    };

    await expect(clientWithLegacyContext.decryptValue("encrypted-value")).rejects.toThrow(
      "Encryption Context does not match expected values",
    );
  });

  describe("hashValue", () => {
    it("should generate a hash for a valid sensitive string", async () => {
      const hash = await client.hashValue("123-45-6789", 10);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.length).toBe(128); // SHA3-512 = 64 bytes = 128 hex chars
    });

    it("should generate the same hash for the same input (deterministic)", async () => {
      const hash1 = await client.hashValue("123-45-6789", 10);
      const hash2 = await client.hashValue("123-45-6789", 10);
      expect(hash1).toEqual(hash2);
    });

    it("should generate different hashes for different sensitive strings", async () => {
      const hash1 = await client.hashValue("123-45-6789", 10);
      const hash2 = await client.hashValue("987-65-4321", 10);
      expect(hash1).not.toEqual(hash2);
    });

    it("should normalize inputs by removing non-alphanumeric characters", async () => {
      const hash1 = await client.hashValue("123-45-6789", 10);
      const hash2 = await client.hashValue("123456789", 10);
      expect(hash1).toEqual(hash2);
    });

    it("throws an error for empty or non-string input", async () => {
      await expect(client.hashValue("", 10)).rejects.toThrow(
        "Sensitive data must be a non-empty string",
      );
      await expect(
        // eslint-disable-next-line unicorn/no-null
        client.hashValue(null as unknown as string, 10),
      ).rejects.toThrow("Sensitive data must be a non-empty string");
      await expect(client.hashValue(undefined as unknown as string, 10)).rejects.toThrow(
        "Sensitive data must be a non-empty string",
      );
      await expect(client.hashValue(123 as unknown as string, 10)).rejects.toThrow(
        "Sensitive data must be a non-empty string",
      );
    });

    it("should throw with proper error message when pbkdf2 throws an Error", async () => {
      // Mock the wrapper to throw an Error instance via the callback
      jest
        .spyOn(cryptoUtils, "pbkdf2")
        .mockImplementationOnce((_password, _salt, _iterations, _keylen, _digest, callback) => {
          callback(new Error("Specific error message"), Buffer.alloc(0));
          return;
        });

      await expect(client.hashValue("123-45-6789", 10)).rejects.toThrow(
        "Hash generation failed: Specific error message",
      );
    });

    it("should iterate 100000 times by default", async () => {
      /*
       *  This test ensures that the default iteration count is 100000.
       *  We should ONLY be utilizing the iterations override to expedite testing run times.
       *
       *  Changing the iteration default from 100000 will disrupt production data.
       *  Be sure that this is an intentional change before modifying the anticipated output.
       */
      jest
        .spyOn(cryptoUtils, "pbkdf2")
        .mockImplementationOnce((_password, _salt, iterations, _keylen, _digest, callback) => {
          // eslint-disable-next-line unicorn/no-null
          callback(null, Buffer.alloc(64));
          return;
        });

      await client.hashValue("123-45-6789");
      expect(cryptoUtils.pbkdf2).toHaveBeenCalledWith(
        "123456789",
        // "decrypted-value",
        "some-application-salt",
        100000,
        64,
        "sha3-512",
        expect.any(Function),
      );
    });
  });
});

jest.mock("@aws-crypto/client-node", (): MockAWSCryptoType => {
  return {
    encryptValueCalledWith: "",
    decryptValueCalledWith: "",
    encryptKeyringCalledWith: undefined,
    decryptKeyringCalledWith: undefined,
    decryptResult: {
      error: undefined,
      encryptionContext: {
        stage: "some-stage",
        purpose: "some-purpose",
        origin: "some-origin",
      },
    },
    optionsCalledWith: "",
    contextCalledWith: undefined,
    CommitmentPolicy: { REQUIRE_ENCRYPT_REQUIRE_DECRYPT: "REQUIRE_ENCRYPT_REQUIRE_DECRYPT" },
    buildClient: function MockBuildClient(options: string): any {
      this.optionsCalledWith = options;
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const encrypt = (cmm: string, plaintext: string, op?: AWSMockContext): any => {
        this.encryptKeyringCalledWith = cmm;
        this.encryptValueCalledWith = plaintext;
        this.contextCalledWith = { ...op };
        return Promise.resolve(plaintext).then((): any => {
          return { result: plaintext, messeageHeader: "message-header" };
        });
      };
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const decrypt = (keyring: AWSCrypto.KeyringNode, value: string): any => {
        const encoder = new TextEncoder();
        this.decryptKeyringCalledWith = keyring;
        this.decryptValueCalledWith = value;
        if (this.decryptResult.error) {
          return Promise.reject(this.decryptResult.error);
        }
        return Promise.resolve(value).then((): any => {
          return {
            plaintext: encoder.encode("decrypted-value"),
            messageHeader: {
              encryptionContext: this.decryptResult.encryptionContext,
            },
          };
        });
      };
      return { encrypt, decrypt };
    },
    KmsKeyringNode: jest.fn(function MockKeyRingNode(): any {}),
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
