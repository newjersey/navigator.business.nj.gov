import { RemovalPolicy, Stack, StackProps, Duration } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as backup from "aws-cdk-lib/aws-backup";
import { Construct } from "constructs";

export interface BackupStackProps extends StackProps {
  backupRole: iam.IRole;
  tableNames: string[];
}

export class BackupStack extends Stack {
  constructor(scope: Construct, id: string, props: BackupStackProps) {
    super(scope, id, props);

    const vault = new backup.BackupVault(this, "BizX_dynamodb_BackupsVault", {
      backupVaultName: "BizX_dynamodb_backups",
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const plan = new backup.BackupPlan(this, "BizX_dynamodb_BackupPlan", {
      backupPlanName: "BizX_dynamodb_backup_plan",
      backupVault: vault,
    });

    plan.addRule(
      new backup.BackupPlanRule({
        ruleName: "BizX_dynamodb_backup_rule",
        scheduleExpression: events.Schedule.cron({
          minute: "0",
          hour: "*/3",
        }),
        moveToColdStorageAfter: Duration.days(14),
        deleteAfter: Duration.days(180),
      }),
    );

    const tables = props.tableNames.map((tableName, index) =>
      dynamodb.Table.fromTableName(this, `ImportedTable${index}`, tableName),
    );

    plan.addSelection("BizX_dynamodb_BackupSelection", {
      role: props.backupRole,
      resources: tables.map((table) => backup.BackupResource.fromDynamoDbTable(table)),
    });
  }
}
