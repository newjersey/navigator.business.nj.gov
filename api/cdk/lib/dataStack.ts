import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { BUSINESSES_TABLE, MESSAGES_TABLE, USERS_TABLE } from "./constants";
import { createDynamoDBTable } from "./stackUtils";
export interface DataStackProps extends StackProps {
  stage: string;
}

function createUsersTable(
  scope: Construct,
  tableName: string,
  stage: string,
  removalPolicy: RemovalPolicy,
) {
  return createDynamoDBTable(scope, {
    id: "UsersDynamoDBTable",
    tableName,
    stage,
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
}

function createBusinessesTable(
  scope: Construct,
  tableName: string,
  stage: string,
  removalPolicy: RemovalPolicy,
) {
  return createDynamoDBTable(scope, {
    id: "BusinessesDynamoDBTable",
    tableName,
    stage,
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
}

function createMessagesTable(
  scope: Construct,
  tableName: string,
  stage: string,
  removalPolicy: RemovalPolicy,
) {
  return createDynamoDBTable(scope, {
    stage,
    id: "MessagesDynamoDBTable",
    tableName,
    removalPolicy,
    partitionKey: { name: "taskId", type: dynamodb.AttributeType.STRING },
    globalSecondaryIndices: [
      {
        indexName: "DueAtIndex",
        partitionKey: { name: "dueAt", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      },
      {
        indexName: "UserIdIndex",
        partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      },
    ],
  });
}
export class DataStack extends Stack {
  public readonly usersTable?: dynamodb.ITable;
  public readonly businessesTable?: dynamodb.ITable;
  public readonly messagesTable?: dynamodb.ITable;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    const usersTableName = `${USERS_TABLE}-${props.stage}`;
    const businessesTableName = `${BUSINESSES_TABLE}-${props.stage}`;
    const messagesTableName = `${MESSAGES_TABLE}-${props.stage}`;

    const removalPolicy = props.stage === "local" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;
    this.usersTable = createUsersTable(this, usersTableName, props.stage, removalPolicy);
    this.businessesTable = createBusinessesTable(
      this,
      businessesTableName,
      props.stage,
      removalPolicy,
    );
    this.messagesTable = createMessagesTable(this, messagesTableName, props.stage, removalPolicy);
  }
}
