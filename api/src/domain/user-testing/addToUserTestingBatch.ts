import { UserData } from "@shared/userData";
import { AddToUserTesting, UserDataClient, UserDataQlClient } from "../types";

type AddToUserTestingBatchResponse = {
  success: number;
  failed: number;
  total: number;
};

export const addToUserTestingBatch = async (
  addToUserTesting: AddToUserTesting,
  userDataClient: UserDataClient,
  userDataQlClient: UserDataQlClient
): Promise<AddToUserTestingBatchResponse> => {
  const results = await userDataQlClient.getNeedToAddToUserTestingUsers();
  let success = 0;
  let failed = 0;
  const promises: Promise<void>[] = [];
  results.forEach((newUserData: UserData) => {
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
  });

  await Promise.all(promises);

  return { total: results.length, success, failed };
};
