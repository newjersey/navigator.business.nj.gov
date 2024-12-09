import * as fs from "fs";
import * as path from "path";
import {AWSEncryptionDecryptionFactory} from "@businessnjgovnavigator/api/src/client/AwsEncryptionDecryptionFactory";

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

// Specify the directory containing the JSON files
const jsonDirectory = "/Users/jhechter/Desktop/converted_data";
const AWS_CRYPTO_KEY = "";
const AWS_CRYPTO_CONTEXT_STAGE = "";
const AWS_CRYPTO_CONTEXT_PURPOSE = "";
const AWS_CRYPTO_CONTEXT_ORIGIN =  "";

async function findDuplicateTaxIds(directory: string): Promise<void> {
  const taxIdMap: TaxIdMap = new Map();
  let count = 0;

  const AWSEncryptionDecryptionClient = AWSEncryptionDecryptionFactory(AWS_CRYPTO_KEY, {
    stage: AWS_CRYPTO_CONTEXT_STAGE,
    purpose: AWS_CRYPTO_CONTEXT_PURPOSE,
    origin: AWS_CRYPTO_CONTEXT_ORIGIN,
  });

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
          Object.entries(businesses).forEach(async ([businessId, businessData]) => {
            const encryptedTaxId = businessData.profileData?.encryptedTaxId;
            let plainTextTaxId = await AWSEncryptionDecryptionClient.decryptValue(encryptedTaxId);
            if (plainTextTaxId) {
              if (!taxIdMap.has(plainTextTaxId)) {
                taxIdMap.set(plainTextTaxId, []);
              }
              taxIdMap.get(plainTextTaxId)?.push({ userId, businessId });
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

}
findDuplicateTaxIds(jsonDirectory).then(()=> {});


