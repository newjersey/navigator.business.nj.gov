import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { BUSINESSES_TABLE, MESSAGES_TABLE, USERS_TABLE } from "./constants";
import { createDynamoDBTable } from "./stackUtils";
export interface DataStackProps extends StackProps {
  stage: string;
}

export class DataStack extends Stack {
  public readonly usersTable?: dynamodb.ITable;
  public readonly businessesTable?: dynamodb.ITable;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const usersTableName = `${USERS_TABLE}-${props.stage}`;
    const businessesTableName = `${BUSINESSES_TABLE}-${props.stage}`;
    const messagesTableName = `${MESSAGES_TABLE}-${props.stage}`;

    const removalPolicy = props.stage === "local" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;

    if (process.env.CI !== "true" || props.stage === "local") {
      // Create Users table
      createDynamoDBTable(this, {
        id: "UsersDynamoDBTable",
        tableName: usersTableName,
        stage: props.stage,
        partitionKey: {
          name: "userId",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy,
        globalSecondaryIndices: [
          {
            indexName: "EmailIndex",
            partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
        ],
      });
      // Create Businesses table
      createDynamoDBTable(this, {
        id: "BusinessesDynamoDBTable",
        tableName: businessesTableName,
        stage: props.stage,
        partitionKey: {
          name: "businessId",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy,
        globalSecondaryIndices: [
          {
            indexName: "BusinessName",
            partitionKey: {
              name: "businessName",
              type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
          },
          {
            indexName: "NaicsCode",
            partitionKey: { name: "naicsCode", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
          {
            indexName: "Industry",
            partitionKey: { name: "industry", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
          {
            indexName: "HashedTaxId",
            partitionKey: { name: "hashedTaxId", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
          {
            indexName: "BusinessNameWithSortKey",
            partitionKey: { name: "businessNamePartition", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "businessName", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
        ],
      });
      // Create Messages table
      createDynamoDBTable(this, {
        stage: props.stage,
        id: "MessagesDynamoDBTable",
        tableName: messagesTableName,
        removalPolicy,
        partitionKey: { name: "taskId", type: dynamodb.AttributeType.STRING },
        globalSecondaryIndices: [
          {
            indexName: "DueAtIndex",
            partitionKey: { name: "dueAt", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
        ],
      });
    } else {
      this.usersTable = dynamodb.Table.fromTableName(this, "ImportedUsersTable", usersTableName);
      this.businessesTable = dynamodb.Table.fromTableName(
        this,
        "ImportedBusinessesTable",
        businessesTableName,
      );
      createDynamoDBTable(this, {
        stage: props.stage,
        id: "MessagesDynamoDBTable",
        tableName: messagesTableName,
        removalPolicy,
        partitionKey: { name: "taskId", type: dynamodb.AttributeType.STRING },
        globalSecondaryIndices: [
          {
            indexName: "DueAtIndex",
            partitionKey: { name: "dueAt", type: dynamodb.AttributeType.STRING },
            projectionType: dynamodb.ProjectionType.ALL,
          },
        ],
      });
    }
  }
}
