import { UserDataPrime } from "@shared/userData";
import { AddNewsletter, NewsletterClient } from "../types";

export const addNewsletterFactory = (newsletterClient: NewsletterClient): AddNewsletter => {
  return async (userData: UserDataPrime): Promise<UserDataPrime> => {
    const newsletter = await newsletterClient.add(userData.user.email);
    const user: UserDataPrime = {
      ...userData,
      user: {
        ...userData.user,
        externalStatus: {
          ...userData.user.externalStatus,
          newsletter,
        },
      },
    };
    return user;
  };
};
