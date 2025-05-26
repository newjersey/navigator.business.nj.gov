// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSCrypto = require("@aws-crypto/client-node");
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import { CryptoClient } from "@domain/types";
import * as crypto from "node:crypto";
import { TextDecoder } from "node:util";

type Context = {
  stage: string;
  purpose: string;
  origin: string;
};

export const cryptoUtils: { pbkdf2: typeof crypto.pbkdf2 } = {
  pbkdf2: (
    password: crypto.BinaryLike,
    salt: crypto.BinaryLike,
    iterations: number,
    keylen: number,
    digest: string,
    callback: (err: Error | null, derivedKey: Buffer) => void,
  ) => {
    return crypto.pbkdf2(password, salt, iterations, keylen, digest, callback);
  },
};

export const AWSCryptoFactory = (
  generatorKeyId: string,
  context: Context,
  encryptedHashingSalt?: string,
): CryptoClient => {
  const { encrypt, decrypt } = AWSCrypto.buildClient(
    AWSCrypto.CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
  );
  const keyring = new AWSCrypto.KmsKeyringNode({ generatorKeyId });

  const decoder = new TextDecoder();

  const encryptValue = async (plainTextValue: string): Promise<string> => {
    const { result } = await encrypt(keyring, plainTextValue, {
      encryptionContext: context,
    });
    const base64Value = toBase64(result);
    return base64Value;
  };

  const decryptValue = async (encryptedValue: string): Promise<string> => {
    const bufferedValue = fromBase64(encryptedValue);

    const { plaintext, messageHeader } = await decrypt(keyring, bufferedValue);

    const { encryptionContext } = messageHeader;

    for (const [key, value] of Object.entries(context)) {
      if (encryptionContext[key] !== value) {
        throw new Error("Encryption Context does not match expected values");
      }
    }

    const decodedValue = decoder.decode(plaintext);
    return decodedValue;
  };

  const hashValue = async (
    valueToBeHashed: string,
    _iterationsOverride?: number,
  ): Promise<string> => {
    if (!valueToBeHashed || typeof valueToBeHashed !== "string") {
      throw new Error("Sensitive data must be a non-empty string");
    }
    const normalizedString = valueToBeHashed.replaceAll(/[^\dA-Za-z]/g, "");

    if (!encryptedHashingSalt) {
      throw new Error("Salt must be provided");
    }

    const decryptedSalt = await decryptValue(encryptedHashingSalt);
    const iterations = _iterationsOverride || 100000;

    try {
      const hash = await new Promise<string>((resolve, reject) => {
        cryptoUtils.pbkdf2(
          normalizedString,
          decryptedSalt,
          iterations,
          64,
          "sha3-512",
          (err: Error | null, key: Buffer) => {
            if (err) reject(err);
            else resolve(key.toString("hex"));
          },
        );
      });

      return hash;
    } catch (error) {
      throw new Error(
        `Hash generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return { encryptValue, decryptValue, hashValue };
};
