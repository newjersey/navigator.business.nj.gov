// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSCrypto = require("@aws-crypto/client-node");
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import { EncryptionDecryptionClient } from "@domain/types";
import { TextDecoder } from "node:util";

type Context = {
  stage: string;
  purpose: string;
  origin: string;
};

export const AWSEncryptionDecryptionFactory = (
  generatorKeyId: string,
  context: Context,
): EncryptionDecryptionClient => {
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

  return { encryptValue, decryptValue };
};
