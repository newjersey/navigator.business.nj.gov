import { UserData, UserDataClient, UserHandler } from "../types";

export const userHandlerFactory = (userDataClient: UserDataClient): UserHandler => {
  const get = (userId: string): Promise<UserData> => {
    return userDataClient.get(userId);
  };

  const put = (userData: UserData): Promise<UserData> => {
    return userDataClient.put(userData);
  };

  const update = async (userId: string, update: Partial<UserData>): Promise<UserData> => {
    const userData = await userDataClient.get(userId);
    return put({ ...userData, ...update });
  };

  return { get, put, update };
};
