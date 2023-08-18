/* eslint-disable @typescript-eslint/no-explicit-any */
import * as AWSCrypto from "@aws-crypto/client-node";
import { TextEncoder } from "node:util";
import { EncryptionDecryptionClient } from "../domain/types";
import { AWSEncryptionDecryptionFactory } from "./AwsEncryptionDecryptionFactory";

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

describe("AWSEncryptionDecryption", () => {
  let client: EncryptionDecryptionClient;

  beforeEach(() => {
    jest.resetAllMocks();
    client = AWSEncryptionDecryptionFactory("some-key", {
      stage: "some-stage",
      purpose: "some-purpose",
      origin: "some-origin"
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
        origin: "some-origin"
      }
    });
    expect(mockAWSCrypto.optionsCalledWith).toEqual("REQUIRE_ENCRYPT_REQUIRE_DECRYPT");
  });

  it("calls decrypt with the correct value", async () => {
    const result = await client.decryptValue("encrypted-value");
    expect(result).toEqual("decrypted-value");
    expect(mockAWSCrypto.decryptValueCalledWith).toEqual("encrypted-value");
  });
});

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
                origin: "some-origin"
              }
            }
          };
        });
      };
      return { encrypt, decrypt };
    },
    KmsKeyringNode: function MockKeyRingNode(): any {}
  };
});

jest.mock("@aws-sdk/util-base64-node", (): MockAWSBase64 => {
  return {
    fromBase64: function mockFromBase64(value: string): string {
      return value;
    },
    toBase64: function mockToBase64(value: string): string {
      return value;
    }
  };
});
