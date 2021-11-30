import { AddNewsletter, NewsletterClient, UserData, UserDataClient } from "../types";

export const shouldAddToNewsletter = (userData: UserData): boolean =>
  userData.user.receiveNewsletter && !userData.user.externalStatus.newsletter;

export const addNewsletterFactory = (
  userDataClient: UserDataClient,
  newsletterClient: NewsletterClient
): AddNewsletter => {
  return async (userData: UserData): Promise<UserData> => {
    const newsletter = await newsletterClient.add(userData.user.email);
    const user: UserData = {
      ...userData,
      user: {
        ...userData.user,
        externalStatus: {
          ...userData.user.externalStatus,
          newsletter,
        },
      },
    };
    return userDataClient.put(user);
  };
};
