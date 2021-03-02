import { UserData, UserDataClient } from "../domain/types";

export const DynamoUserDataClient = (db: AWS.DynamoDB.DocumentClient, tableName: string): UserDataClient => {
  const get = (userId: string): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userId,
      },
    };

    return db
      .get(params)
      .promise()
      .then((result) => {
        if (!result.Item) {
          return Promise.reject("Not found");
        }
        return result.Item.data;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  const put = (userData: UserData): Promise<UserData> => {
    const params = {
      TableName: tableName,
      Item: {
        userId: userData.user.id,
        data: userData,
      },
    };

    return db
      .put(params)
      .promise()
      .then(() => {
        return userData;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  };

  return {
    get,
    put,
  };
};
