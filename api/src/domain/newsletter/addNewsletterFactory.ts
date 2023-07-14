import { UserData } from "@shared/userData";
import { AddNewsletter, NewsletterClient } from "../types";

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
