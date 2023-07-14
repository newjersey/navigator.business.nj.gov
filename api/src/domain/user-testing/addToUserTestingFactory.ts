import { UserData } from "@shared/userData";
import { AddToUserTesting, UserTestingClient } from "../types";

import { getCurrentBusiness } from "@shared/businessHelpers";

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
