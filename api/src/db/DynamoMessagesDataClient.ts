/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { MessageData, MessagesDataClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";

export const DynamoMessagesDataClient = (
  db: DynamoDBDocumentClient,
  tableName: string,
  logger: LogWriterType,
): MessagesDataClient => {
  const get = async (taskId: string): Promise<MessageData> => {
    const params = {
      TableName: tableName,
      Key: {
        taskId: taskId,
      },
    };
    return db
      .send(new GetCommand(params))

      .then(async (result) => {
        if (!result.Item) {
          logger.LogInfo(`Message task with ID ${taskId} not found in table ${tableName}`);
          throw new Error("Not found");
        }
        return result.Item as MessageData;
      })
      .catch((error) => {
        throw error;
      });
  };

  const put = async (messageData: MessageData): Promise<MessageData> => {
    return db
      .send(new PutCommand({ TableName: tableName, Item: messageData }))
      .then(() => {
        return messageData;
      })
      .catch((error) => {
        throw error;
      });
  };

  const getMessagesDueAt = async (dueAt: string): Promise<MessageData[]> => {
    const results = await db.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "DueAtIndex",
        KeyConditionExpression: "dueAt = :dueAt",
        ExpressionAttributeValues: {
          ":dueAt": dueAt,
        },
      }),
    );
    return (results.Items as MessageData[]) || [];
  };

  const getMessagesByUserId = async (userId: string): Promise<MessageData[]> => {
    const results = await db.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      }),
    );
    return (results.Items as MessageData[]) || [];
  };

  return {
    get,
    put,
    getMessagesDueAt,
    getMessagesByUserId,
  };
};
