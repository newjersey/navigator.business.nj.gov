import { AddNewsletter, UserData, UserDataQlClient } from "../types";

type AddNewsletterBatchResponse = {
  attempts: number;
  total: number;
};
export const addNewsletterBatch = async (
  addNewsletter: AddNewsletter,
  userDataQlClient: UserDataQlClient
): Promise<AddNewsletterBatchResponse> => {
  let attempts = 0;
  const results = await userDataQlClient.getNeedNewsletterUsers();
  results.forEach(async (newUserData: UserData) => {
    attempts += 1;
    addNewsletter(newUserData);
  });
  return { attempts, total: results.length };
};
