import {
  type DynamoDBDocumentClient,
  TransactWriteCommand,
  type TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { createBusinessDataItem } from "@db/DynamoBusinessDataClient";
import { createUserDataItem } from "@db/DynamoUserDataClient";
import {
  MigrationConflictError,
  type MigrationDataClient,
  type UserDataClient,
} from "@domain/types";
import { type UserData } from "@shared/userData";

const MAX_TRANSACTION_BUSINESSES = 99;

interface DynamoMigrationDataClientProps {
  readonly db: DynamoDBDocumentClient;
  readonly userDataClient: UserDataClient;
  readonly usersTableName: string;
  readonly businessesTableName: string;
}

const isMigrationConflict = (error: unknown): boolean => {
  if (!error || typeof error !== "object" || !("name" in error)) {
    return false;
  }

  const cancellationReasons =
    "CancellationReasons" in error && Array.isArray(error.CancellationReasons)
      ? error.CancellationReasons
      : [];

  return (
    error.name === "TransactionCanceledException" &&
    (cancellationReasons[0]?.Code === "ConditionalCheckFailed" ||
      cancellationReasons.some((reason) => reason?.Code === "TransactionConflict"))
  );
};

const businessPut = (
  business: UserData["businesses"][string],
  tableName: string,
): NonNullable<TransactWriteCommandInput["TransactItems"]>[number] => ({
  Put: {
    TableName: tableName,
    Item: createBusinessDataItem(business),
  },
});

export const DynamoMigrationDataClient = ({
  db,
  userDataClient,
  usersTableName,
  businessesTableName,
}: DynamoMigrationDataClientProps): MigrationDataClient => {
  const migrateAndPut = async (sourceUserData: UserData): Promise<UserData> => {
    const sourceBusinessCount = Object.keys(sourceUserData.businesses ?? {}).length;
    if (sourceBusinessCount > MAX_TRANSACTION_BUSINESSES) {
      throw new Error(
        `Cannot atomically migrate user with more than ${MAX_TRANSACTION_BUSINESSES} businesses`,
      );
    }

    const migratedUserData = await userDataClient.migrateToLatest(sourceUserData);
    const migratedBusinesses = Object.values(migratedUserData.businesses);
    if (migratedBusinesses.length > MAX_TRANSACTION_BUSINESSES) {
      throw new Error(
        `Cannot atomically migrate user with more than ${MAX_TRANSACTION_BUSINESSES} businesses`,
      );
    }

    const transactItems: NonNullable<TransactWriteCommandInput["TransactItems"]> = [
      {
        Put: {
          TableName: usersTableName,
          Item: createUserDataItem(migratedUserData),
          ConditionExpression: "attribute_not_exists(#data) OR #data = :sourceData",
          ExpressionAttributeNames: {
            "#data": "data",
          },
          ExpressionAttributeValues: {
            ":sourceData": sourceUserData,
          },
        },
      },
      ...migratedBusinesses.map((business) => businessPut(business, businessesTableName)),
    ];

    try {
      await db.send(new TransactWriteCommand({ TransactItems: transactItems }));
    } catch (error) {
      if (isMigrationConflict(error)) {
        throw new MigrationConflictError();
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Atomic migration transaction failed: ${message}`, { cause: error });
    }

    return migratedUserData;
  };

  return { migrateAndPut };
};
