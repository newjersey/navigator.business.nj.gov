import { AddNewsletter, UserDataQlClient } from "../types";
import { UserData } from "@shared/userData";

type AddNewsletterBatchResponse = {
  success: number;
  failed: number;
  total: number;
};

export const addNewsletterBatch = async (
  addNewsletter: AddNewsletter,
  userDataQlClient: UserDataQlClient
): Promise<AddNewsletterBatchResponse> => {
  const results = await userDataQlClient.getNeedNewsletterUsers();
  let success = 0;
  let failed = 0;
  const promises: Promise<void>[] = [];
  results.forEach((newUserData: UserData) => {
    promises.push(
      addNewsletter(newUserData)
        .then((result) => {
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
