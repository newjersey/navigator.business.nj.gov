import { AddToUserTesting, UserDataClient } from "@domain/types";

type AddToUserTestingBatchResponse = {
  success: number;
  failed: number;
  total: number;
};

export const addToUserTestingBatch = async (
  addToUserTesting: AddToUserTesting,
  userDataClient: UserDataClient
): Promise<AddToUserTestingBatchResponse> => {
  const results = await userDataClient.getNeedToAddToUserTestingUsers();
  let success = 0;
  let failed = 0;
  const promises: Promise<void>[] = [];
  for (const newUserData of results) {
    promises.push(
      addToUserTesting(newUserData)
        .then((result) => {
          userDataClient.put(result);
          if (result.user.externalStatus.userTesting?.success) {
            success += 1;
          } else {
            failed += 1;
          }
        })
        .catch(() => {
          failed += 1;
        })
    );
  }

  await Promise.all(promises);

  return { total: results.length, success, failed };
};
