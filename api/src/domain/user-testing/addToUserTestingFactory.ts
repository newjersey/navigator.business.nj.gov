import { UserData } from "@shared/userData";
import { AddToUserTesting, UserTestingClient } from "../types";

export const addToUserTestingFactory = (userTestingClient: UserTestingClient): AddToUserTesting => {
  return async (userData: UserData): Promise<UserData> => {
    const userTesting = await userTestingClient.add(userData.user, userData.businesses[userData.currentBusinessID].profileData);
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
