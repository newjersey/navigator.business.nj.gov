/* eslint-disable unicorn/filename-case */
/* eslint-disable no-undef */
module.exports = {
  tables: [
    {
      TableName: "users-table-test",
      AttributeDefinitions: [
        {
          AttributeName: "userId",
          AttributeType: "S",
        },
        {
          AttributeName: "email",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "userId",
          KeyType: "HASH",
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "EmailIndex",
          KeySchema: [
            {
              AttributeName: "email",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
    {
      TableName: "businesses-table-test",
      AttributeDefinitions: [
        {
          AttributeName: "businessId",
          AttributeType: "S",
        },
        {
          AttributeName: "businessNamePartition",
          AttributeType: "S",
        },
        {
          AttributeName: "businessName",
          AttributeType: "S",
        },
        {
          AttributeName: "naicsCode",
          AttributeType: "S",
        },
        {
          AttributeName: "industry",
          AttributeType: "S",
        },
        {
          AttributeName: "hashedTaxId",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "businessId",
          KeyType: "HASH",
        },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "BusinessName",
          KeySchema: [
            {
              AttributeName: "businessName",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
        {
          IndexName: "NaicsCode",
          KeySchema: [
            {
              AttributeName: "naicsCode",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
        {
          IndexName: "Industry",
          KeySchema: [
            {
              AttributeName: "industry",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
        {
          IndexName: "HashedTaxId",
          KeySchema: [
            {
              AttributeName: "hashedTaxId",
              KeyType: "HASH",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 25,
            WriteCapacityUnits: 25,
          },
        },
        {
          IndexName: "BusinessNameWithSortKey",
          KeySchema: [
            {
              AttributeName: "businessNamePartition",
              KeyType: "HASH",
            },
            {
              AttributeName: "businessName",
              KeyType: "RANGE",
            },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  ],
  port: 8002,
};
