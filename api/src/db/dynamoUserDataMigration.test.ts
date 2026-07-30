// We should try not to do this; if you do need to disable typescript please include a comment justifying why.
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig, DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { type CryptoClient, type UserDataClient } from "@domain/types";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";
import * as sharedUserData from "@shared/userData";

function setupMockSharedUserData(): typeof sharedUserData {
  return {
    ...jest.requireActual("@shared/userData").default,
    CURRENT_VERSION: 2,
  };
}

jest.mock("@shared/userData", () => setupMockSharedUserData());
jest.mock("@db/migrations/migrations", () => {
  return {
    Migrations: [migrate_v0_to_v1, migrate_v1_to_v2],
  };
});

// references jest-dynalite-config values
const dbConfig = {
  tableName: "users-table-test",
};

let laterMigrationRan = false;

const makeParams = (data: any): { TableName: string; Item: any } => {
  return {
    TableName: dbConfig.tableName,
    Item: {
      userId: data.user.id,
      data: { ...data },
    },
  };
};

describe("DynamoUserDataClient Migrations", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoUserDataClient: UserDataClient;
  let cryptoClient: CryptoClient;
  let logger: LogWriterType;

  beforeEach(async () => {
    laterMigrationRan = false;
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    cryptoClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    logger = DummyLogWriter;
    dynamoUserDataClient = DynamoUserDataClient(client, cryptoClient, dbConfig.tableName, logger);
    await insertOldData();
  });

  it("migrates a cloned initial record without persisting it", async () => {
    const source = await dynamoUserDataClient.get("v0-id");
    expect(source).toEqual({
      user: {
        id: "v0-id",
      },
      v0Field: "some-v0-value",
      version: 0,
    });

    expect(await dynamoUserDataClient.migrateToLatest(source)).toEqual({
      user: {
        id: "v0-id",
      },
      v0FieldRenamed: "some-v0-value",
      newV2Field: "",
      version: 2,
    });

    expect(await getDbItem("v0-id")).toEqual({
      user: {
        id: "v0-id",
      },
      v0Field: "some-v0-value",
      version: 0,
    });
  });

  it("stops at the first failed migration without mutating or stamping the source", async () => {
    const source = await dynamoUserDataClient.get("failing-v0-id");
    const original = structuredClone(source);

    await expect(dynamoUserDataClient.migrateToLatest(source)).rejects.toThrow(
      "v0 migration failed",
    );

    expect(laterMigrationRan).toBe(false);
    expect(source).toEqual(original);
    expect(await getDbItem("failing-v0-id")).toEqual(original);
  });

  it("migrates data from v1 through the pure migration method", async () => {
    const source = await dynamoUserDataClient.get("v1-id");
    expect(await dynamoUserDataClient.migrateToLatest(source)).toEqual({
      user: {
        id: "v1-id",
      },
      v0FieldRenamed: "some-v1-data",
      newV2Field: "",
      version: 2,
    });
  });

  it("puts the supplied version without running migrations", async () => {
    const v1Data = await getDbItem("v1-id");

    expect(await dynamoUserDataClient.put(v1Data)).toEqual(v1Data);
    expect(await getDbItem("v1-id")).toEqual(v1Data);
  });

  it("does not migrate data when in most recent schema", async () => {
    expect(await dynamoUserDataClient.get("v2-id")).toEqual({
      user: {
        id: "v2-id",
      },
      v0FieldRenamed: "some-v2-data",
      newV2Field: "some-value",
      version: 2,
    });
  });

  it("does not synthesize a version while persisting", async () => {
    const v2Data = {
      user: {
        id: "v2-id",
      },
      v0FieldRenamed: "some-v2-data",
      newV2Field: "some-value",
    };

    // @ts-ignore
    await dynamoUserDataClient.put(v2Data);

    expect(await getDbItem("v2-id")).toEqual(v2Data);
  });

  const insertOldData = async (): Promise<void> => {
    await client.send(new PutCommand(makeParams(v0Data)));
    await client.send(new PutCommand(makeParams(failingV0Data)));
    await client.send(new PutCommand(makeParams(v1Data)));
    await client.send(new PutCommand(makeParams(v2Data)));
  };

  const getDbItem = async (id: string): Promise<any> => {
    const params = {
      TableName: dbConfig.tableName,
      Key: {
        userId: id,
      },
    };

    return client.send(new GetCommand(params)).then((result) => {
      return result.Item?.data;
    });
  };
});

type v0 = {
  user: {
    id: string;
  };
  v0Field: string;
};

type v1 = {
  user: {
    id: string;
  };
  v0FieldRenamed: string;
  version: number;
};

type v2 = {
  user: {
    id: string;
  };
  v0FieldRenamed: string;
  newV2Field: string;
  version: number;
};

const v0Data = {
  user: {
    id: "v0-id",
  },
  v0Field: "some-v0-value",
  version: 0,
};

const v1Data = {
  user: {
    id: "v1-id",
  },
  v0FieldRenamed: "some-v1-data",
  version: 1,
};

const failingV0Data = {
  user: {
    id: "failing-v0-id",
  },
  v0Field: "fail",
  version: 0,
};

const v2Data = {
  user: {
    id: "v2-id",
  },
  v0FieldRenamed: "some-v2-data",
  newV2Field: "some-value",
  version: 2,
};

function migrate_v0_to_v1(data: v0): v1 {
  if (data.v0Field === "fail") {
    throw new Error("v0 migration failed");
  }

  const { v0Field, ...rest } = data;
  return {
    ...rest,
    v0FieldRenamed: v0Field,
    version: 1,
  };
}

function migrate_v1_to_v2(data: v1): v2 {
  laterMigrationRan = true;
  return {
    ...data,
    newV2Field: "",
    version: 2,
  };
}
