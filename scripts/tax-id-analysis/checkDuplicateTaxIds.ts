/**
 * Storing this file in scripts/ for record keeping purposes. I had to run it in the context of the api/ dir to be able
 * to import and use AWSEncryptionDecryptionFactory. Given it's not likely we'll need to use this again in the near term
 * I didn't find it important to make the proper changes to TypeScript in order to get this to execute from scripts/.
 * */

// @ts-nocheck

import { AWSEncryptionDecryptionFactory } from "@client/AwsEncryptionDecryptionFactory";
import * as fs from "node:fs";
import * as path from "node:path";

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

type TaxIdMap = Map<
  string,
  Array<{ userId: string | undefined; businessId: string }>
>;

const jsonDirectory = "source dir";
const AWS_CRYPTO_KEY = "ARN for KMS key";
const AWS_CRYPTO_CONTEXT_STAGE = "stage";
const AWS_CRYPTO_CONTEXT_PURPOSE = "purpose";
const AWS_CRYPTO_CONTEXT_ORIGIN = "region";

async function findDuplicateTaxIds(directory: string): Promise<void> {
  const taxIdMap: TaxIdMap = new Map();
  let count = 0;

  const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(
    AWS_CRYPTO_KEY,
    {
      stage: AWS_CRYPTO_CONTEXT_STAGE,
      purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
      origin: AWS_CRYPTO_CONTEXT_ORIGIN,
    }
  );

  const files = fs.readdirSync(directory);
  for (const filename of files) {
    if (filename.endsWith(".json")) {
      console.log(`Reading ${filename}`);
      const filepath = path.join(directory, filename);

      try {
        const fileContent = fs.readFileSync(filepath, "utf8");
        const data: FileData = JSON.parse(fileContent);

        for (const user of data.Items) {
          count++;
          const userId = user.userId;
          console.log(`\tProcessing user #${count}, userId: ${userId}`);

          const businesses = user.data?.businesses || {};

          for (const [businessId, businessData] of Object.entries(businesses)) {
            const encryptedTaxId = businessData.profileData?.encryptedTaxId;
            let plainTextTaxId;
            if (encryptedTaxId) {
              plainTextTaxId = await AWSEncryptionDecryptionClient.decryptValue(
                encryptedTaxId
              ).then((decodedId): string => {
                return decodedId;
              });
            }
            if (plainTextTaxId) {
              if (!taxIdMap.has(plainTextTaxId)) {
                taxIdMap.set(plainTextTaxId, []);
              }
              taxIdMap.get(plainTextTaxId)?.push({ userId, businessId });
            }
          }
        }
      } catch (error) {
        console.error(`Error reading or parsing file: ${filename}`, error);
      }
    }
  }

  for (const [encryptedTaxId, entries] of taxIdMap.entries()) {
    if (entries.length > 1) {
      console.log("\n");
      console.log(`Duplicate encryptedTaxId found: ${encryptedTaxId}`);
      for (const { userId, businessId } of entries) {
        console.log(`  UserId: ${userId}, BusinessId: ${businessId}`);
      }
    }
  }

  const duplicates = [];
  for (const [plainTextTaxId, entries] of taxIdMap.entries()) {
    if (entries.length > 1) {
      duplicates.push({
        [plainTextTaxId]: entries,
      });
    }
  }

  console.log(JSON.stringify(duplicates, undefined, 2));
}
