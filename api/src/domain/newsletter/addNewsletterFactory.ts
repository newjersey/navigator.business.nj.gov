import { AddNewsletter, NewsletterClient } from "@domain/types";
import { UserData } from "@shared/userData";

export const addNewsletterFactory = (newsletterClient: NewsletterClient): AddNewsletter => {
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
    return user;
  };
};
