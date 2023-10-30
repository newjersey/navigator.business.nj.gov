import { UserData } from "@shared/userData";

import { AddToUserTesting, UserTestingClient } from "@domain/types";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";

export const addToUserTestingFactory = (userTestingClient: UserTestingClient): AddToUserTesting => {
  return async (userData: UserData): Promise<UserData> => {
    const userTesting = await userTestingClient.add(userData.user, getCurrentBusiness(userData).profileData);
    const user: UserData = {
      ...userData,
      user: {
        ...userData.user,
        externalStatus: {
          ...userData.user.externalStatus,
          userTesting,
        },
      },
    };
    return user;
  };
};
