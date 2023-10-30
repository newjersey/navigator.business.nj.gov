import { EncryptTaxId, UserDataClient } from "@domain/types";

type EncryptTaxIdBatchResponse = {
  success: number;
  failed: number;
  total: number;
};

export const encryptTaxIdBatch = async (
  encryptTaxId: EncryptTaxId,
  userDataClient: UserDataClient
): Promise<EncryptTaxIdBatchResponse> => {
  const results = await userDataClient.getNeedTaxIdEncryptionUsers();
  let success = 0;
  let failed = 0;
  const promises: Promise<void>[] = [];
  for (const newUserData of results) {
    promises.push(
      encryptTaxId(newUserData)
        .then((result) => {
          userDataClient.put(result);
          success += 1;
        })
        .catch(() => {
          failed += 1;
        })
    );
  }

  await Promise.all(promises);

  return { total: results.length, success, failed };
};
