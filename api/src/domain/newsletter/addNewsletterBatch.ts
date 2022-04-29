import { UserData } from "@shared/userData";
import { AddNewsletter, UserDataClient, UserDataQlClient } from "../types";

type AddNewsletterBatchResponse = {
  readonly success: number;
  readonly failed: number;
  readonly total: number;
};

export const addNewsletterBatch = async (
  addNewsletter: AddNewsletter,
  userDataClient: UserDataClient,
  userDataQlClient: UserDataQlClient
): Promise<AddNewsletterBatchResponse> => {
  const results = await userDataQlClient.getNeedNewsletterUsers();
  let success = 0;
  let failed = 0;
  // eslint-disable-next-line functional/prefer-readonly-type
  const promises: Promise<void>[] = [];
  results.forEach((newUserData: UserData) => {
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
  });

  await Promise.all(promises);

  return { total: results.length, success, failed };
};
