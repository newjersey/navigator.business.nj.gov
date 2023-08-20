// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWSCrypto = require("@aws-crypto/client-node");
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import { TextDecoder } from "node:util";
import { EncryptionDecryptionClient } from "../domain/types";

type Context = {
  stage: string;
  purpose: string;
  origin: string;
};

export const AWSEncryptionDecryptionFactory = (
  generatorKeyId: string,
  context: Context
): EncryptionDecryptionClient => {
  const { encrypt, decrypt } = AWSCrypto.buildClient(
    AWSCrypto.CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT
  );
  const keyring = new AWSCrypto.KmsKeyringNode({ generatorKeyId });

  const decoder = new TextDecoder();

  const encryptValue = async (plainTextTaxId: string): Promise<string> => {
    const { result } = await encrypt(keyring, plainTextTaxId, {
      encryptionContext: context,
    });
    const base64TaxId = toBase64(result);
    return base64TaxId;
  };

  const decryptValue = async (encryptedTaxId: string): Promise<string> => {
    const bufferedTaxId = fromBase64(encryptedTaxId);
    const { plaintext, messageHeader } = await decrypt(keyring, bufferedTaxId);

    const { encryptionContext } = messageHeader;

    for (const [key, value] of Object.entries(context)) {
      if (encryptionContext[key] !== value) {
        throw new Error("Encryption Context does not match expected values");
      }
    }

    const decodedTaxId = decoder.decode(plaintext);
    return decodedTaxId;
  };

  return { encryptValue, decryptValue };
};
