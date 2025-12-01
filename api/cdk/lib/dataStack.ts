import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { applyStandardTags } from "./stackUtils";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { BUSINESSES_TABLE, USERS_TABLE } from "./constants";

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

    const removalPolicy = props.stage === "local" ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN;

    if (process.env.CI !== "true" || props.stage === "local") {
      const usersTable = new dynamodb.Table(this, "UsersDynamoDBTable", {
        tableName: usersTableName,
        partitionKey: {
          name: "userId",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy,
      });

      usersTable.addGlobalSecondaryIndex({
        indexName: "EmailIndex",
        partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      });

      applyStandardTags(usersTable, props.stage);
      const businessesTable = new dynamodb.Table(this, "BusinessesDynamoDBTable", {
        tableName: businessesTableName,
        partitionKey: {
          name: "businessId",
          type: dynamodb.AttributeType.STRING,
        },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy,
      });

      businessesTable.addGlobalSecondaryIndex({
        indexName: "BusinessName",
        partitionKey: {
          name: "businessName",
          type: dynamodb.AttributeType.STRING,
        },
        projectionType: dynamodb.ProjectionType.ALL,
      });

      businessesTable.addGlobalSecondaryIndex({
        indexName: "NaicsCode",
        partitionKey: { name: "naicsCode", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      });

      businessesTable.addGlobalSecondaryIndex({
        indexName: "Industry",
        partitionKey: { name: "industry", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      });

      businessesTable.addGlobalSecondaryIndex({
        indexName: "HashedTaxId",
        partitionKey: { name: "hashedTaxId", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      });

      businessesTable.addGlobalSecondaryIndex({
        indexName: "BusinessNameWithSortKey",
        partitionKey: { name: "businessNamePartition", type: dynamodb.AttributeType.STRING },
        sortKey: { name: "businessName", type: dynamodb.AttributeType.STRING },
        projectionType: dynamodb.ProjectionType.ALL,
      });

      applyStandardTags(businessesTable, props.stage);
    } else {
      this.usersTable = dynamodb.Table.fromTableName(this, "ImportedUsersTable", usersTableName);
      this.businessesTable = dynamodb.Table.fromTableName(
        this,
        "ImportedBusinessesTable",
        businessesTableName,
      );
    }
  }
}
