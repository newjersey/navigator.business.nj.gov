import * as fs from "fs";
import * as path from "path";
import { fromBase64, toBase64 } from "@aws-sdk/util-base64-node";
import { TextDecoder } from "node:util";
const AWSCrypto = require("@aws-crypto/client-node");

interface EncryptionDecryptionClient {
  encryptValue: (valueToBeEncrypted: string) => Promise<string>;
  decryptValue: (valueToBeDecrypted: string) => Promise<string>;
}

interface BusinessProfile {
  profileData?: {
    encryptedTaxId?: string;
  };
}

interface User {
  userId?: string;
  data?: {
    businesses?: Record<string, BusinessProfile>;
  };
}

interface FileData {
  Items: User[];
}

type TaxIdMap = Map<string, Array<{ userId: string | undefined; businessId: string }>>;

function findDuplicateTaxIds(directory: string): void {
  const taxIdMap: TaxIdMap = new Map();
  let count = 0;

  // Iterate over all files in the specified directory
  const files = fs.readdirSync(directory);
  files.forEach((filename) => {
    if (filename.endsWith(".json")) {
      console.log(`Reading ${filename}`);
      const filepath = path.join(directory, filename);

      try {
        const fileContent = fs.readFileSync(filepath, "utf-8");
        const data: FileData = JSON.parse(fileContent);

        data.Items.forEach((user) => {
          count++;
          const userId = user.userId;
          console.log(`\tProcessing user #${count}, userId: ${userId}`);

          const businesses = user.data?.businesses || {};

          // Iterate over each business and extract the encrypted tax ID
          Object.entries(businesses).forEach(([businessId, businessData]) => {
            const encryptedTaxId = businessData.profileData?.encryptedTaxId;
            const decryptedTaxId =
            if (encryptedTaxId) {
              if (!taxIdMap.has(encryptedTaxId)) {
                taxIdMap.set(encryptedTaxId, []);
              }
              taxIdMap.get(encryptedTaxId)?.push({ userId, businessId });
            }
          });
        });
      } catch (error) {
        console.error(`Error reading or parsing file: ${filename}`, error);
      }
    }
  });

  // Check for duplicates and print them
  taxIdMap.forEach((entries, encryptedTaxId) => {
    if (entries.length > 1) {
      console.log("\n");
      console.log(`Duplicate encryptedTaxId found: ${encryptedTaxId}`);
      entries.forEach(({ userId, businessId }) => {
        console.log(`  UserId: ${userId}, BusinessId: ${businessId}`);
      });
    }
  });


  type Context = {
    stage: string;
    purpose: string;
    origin: string;
  };

  const AWSEncryptionDecryptionFactory = (
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

}

// Specify the directory containing the JSON files
const jsonDirectory = "/Users/jhechter/Desktop/converted_data";
findDuplicateTaxIds(jsonDirectory);


