import { UserDataPrime } from "@shared/userData";
import { AddToUserTesting, UserTestingClient } from "../types";

import { getCurrentBusiness } from "@shared/businessHelpers";

export const addToUserTestingFactory = (userTestingClient: UserTestingClient): AddToUserTesting => {
  return async (userData: UserDataPrime): Promise<UserDataPrime> => {
    const userTesting = await userTestingClient.add(userData.user, getCurrentBusiness(userData).profileData);
    const user: UserDataPrime = {
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
