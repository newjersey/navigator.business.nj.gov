/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

import AWS from "aws-sdk";
import { UserDataClient } from "../domain/types";
import { DynamoUserDataClient } from "./DynamoUserDataClient";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "users-table-test",
};

jest.mock("./migrations/migrations", () => ({
  Migrations: [migrate_v0_to_v1, migrate_v1_to_v2],
  CURRENT_VERSION: 2,
}));

describe("DynamoUserDataClient Migrations", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: AWS.DynamoDB.DocumentClient;
  let dynamoUserDataClient: UserDataClient;

  beforeEach(async () => {
    client = new AWS.DynamoDB.DocumentClient(config);
    dynamoUserDataClient = DynamoUserDataClient(client, dbConfig.tableName);
    await insertOldData();
  });

  it("migrates and saves data from initial state without version", async () => {
    expect(await dynamoUserDataClient.get("v0-id")).toEqual({
      user: {
        id: "v0-id",
      },
      v0FieldRenamed: "some-v0-value",
      newV2Field: "",
    });

    expect(await getDbItem("v0-id")).toEqual({
      user: {
        id: "v0-id",
      },
      v0FieldRenamed: "some-v0-value",
      newV2Field: "",
      version: 2,
    });
  });

  it("migrates data from v1 state without version", async () => {
    expect(await dynamoUserDataClient.get("v1-id")).toEqual({
      user: {
        id: "v1-id",
      },
      v0FieldRenamed: "some-v1-data",
      newV2Field: "",
    });

    expect(await getDbItem("v1-id")).toEqual({
      user: {
        id: "v1-id",
      },
      v0FieldRenamed: "some-v1-data",
      newV2Field: "",
      version: 2,
    });
  });

  it("does not migrate data when in most recent schema", async () => {
    expect(await dynamoUserDataClient.get("v2-id")).toEqual({
      user: {
        id: "v2-id",
      },
      v0FieldRenamed: "some-v2-data",
      newV2Field: "some-value",
    });
  });

  it("adds current version to inserted data", async () => {
    const v2Data = {
      user: {
        id: "v2-id",
      },
      v0FieldRenamed: "some-v2-data",
      newV2Field: "some-value",
    };

    // @ts-ignore
    await dynamoUserDataClient.put(v2Data);

    expect(await getDbItem("v2-id")).toEqual({
      user: {
        id: "v2-id",
      },
      v0FieldRenamed: "some-v2-data",
      newV2Field: "some-value",
      version: 2,
    });
  });

  const insertOldData = async () => {
    const makeParams = (data: any) => ({
      TableName: dbConfig.tableName,
      Item: {
        userId: data.user.id,
        data: { ...data },
      },
    });

    await client.put(makeParams(v0Data)).promise();
    await client.put(makeParams(v1Data)).promise();
    await client.put(makeParams(v2Data)).promise();
  };

  const getDbItem = async (id: string): Promise<any> => {
    const params = {
      TableName: dbConfig.tableName,
      Key: {
        userId: id,
      },
    };

    return client
      .get(params)
      .promise()
      .then((result) => result.Item?.data);
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
};

const v1Data = {
  user: {
    id: "v1-id",
  },
  v0FieldRenamed: "some-v1-data",
  version: 1,
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
  const { v0Field, ...rest } = data;
  return {
    ...rest,
    v0FieldRenamed: data.v0Field,
    version: 1,
  };
}

function migrate_v1_to_v2(data: v1): v2 {
  return {
    ...data,
    newV2Field: "",
    version: 2,
  };
}
