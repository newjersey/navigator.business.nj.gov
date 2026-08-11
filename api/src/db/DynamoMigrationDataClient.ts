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

interface PutMigratedUserProps {
  readonly conditionExpression: string;
  readonly expectedUserData: UserData;
  readonly migratedUserData: UserData;
}

export const DynamoMigrationDataClient = ({
  db,
  userDataClient,
  usersTableName,
  businessesTableName,
}: DynamoMigrationDataClientProps): MigrationDataClient => {
  const migrate = async (sourceUserData: UserData): Promise<UserData> => {
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

    return migratedUserData;
  };

  const putMigratedUser = async ({
    conditionExpression,
    expectedUserData,
    migratedUserData,
  }: PutMigratedUserProps): Promise<void> => {
    const migratedBusinesses = Object.values(migratedUserData.businesses);
    const transactItems: NonNullable<TransactWriteCommandInput["TransactItems"]> = [
      {
        Put: {
          TableName: usersTableName,
          Item: createUserDataItem(migratedUserData),
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: {
            "#data": "data",
          },
          ExpressionAttributeValues: {
            ":sourceData": expectedUserData,
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
  };

  const migrateAndPut = async (sourceUserData: UserData): Promise<UserData> => {
    const migratedUserData = await migrate(sourceUserData);
    await putMigratedUser({
      conditionExpression: "attribute_not_exists(#data) OR #data = :sourceData",
      expectedUserData: sourceUserData,
      migratedUserData,
    });
    return migratedUserData;
  };

  const migrateAndPutSubmittedUser = async (submittedUserData: UserData): Promise<UserData> => {
    const migratedUserData = await migrate(submittedUserData);

    try {
      await putMigratedUser({
        conditionExpression: "attribute_not_exists(#data) OR #data = :sourceData",
        expectedUserData: submittedUserData,
        migratedUserData,
      });
      return migratedUserData;
    } catch (error) {
      if (!(error instanceof MigrationConflictError)) {
        throw error;
      }
    }

    const latestUserData = await userDataClient.get(submittedUserData.user.id);
    if (latestUserData.version !== migratedUserData.version) {
      throw new MigrationConflictError();
    }

    await putMigratedUser({
      conditionExpression: "#data = :sourceData",
      expectedUserData: latestUserData,
      migratedUserData,
    });
    return migratedUserData;
  };

  return { migrateAndPut, migrateAndPutSubmittedUser };
};
