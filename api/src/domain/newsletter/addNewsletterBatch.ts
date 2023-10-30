import { AddNewsletter, UserDataClient } from "@domain/types";

type AddNewsletterBatchResponse = {
  success: number;
  failed: number;
  total: number;
};

export const addNewsletterBatch = async (
  addNewsletter: AddNewsletter,
  userDataClient: UserDataClient
): Promise<AddNewsletterBatchResponse> => {
  const results = await userDataClient.getNeedNewsletterUsers();
  let success = 0;
  let failed = 0;
  const promises: Promise<void>[] = [];
  for (const newUserData of results) {
    promises.push(
      addNewsletter(newUserData)
        .then((result) => {
          userDataClient.put(result);
          if (result.user.externalStatus.newsletter?.success) {
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
