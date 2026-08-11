import { validateCiphertextMetadata } from "@client/CiphertextMetadata";
import { QuarantinedCiphertextError } from "@domain/types";
import { resolveForeignEnvironmentPolicy } from "@functions/config";
import { CURRENT_VERSION } from "@shared/userData";
import { DynamoDBClient, ScanCommand, type ScanCommandOutput } from "@aws-sdk/client-dynamodb";
import { GetFunctionConfigurationCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";

interface ScriptOptions {
  readonly tableName: string;
  readonly functionName: string;
  readonly region: string;
}

interface QuarantineFinding {
  readonly userId: string;
  readonly email: string;
  readonly fieldName: string;
  readonly reason: string;
}

interface EncryptedField {
  readonly name: string;
  readonly path: readonly string[];
}

const encryptedFields: readonly EncryptedField[] = [
  { name: "profileData.encryptedTaxId", path: ["profileData", "encryptedTaxId"] },
  { name: "profileData.encryptedTaxPin", path: ["profileData", "encryptedTaxPin"] },
  { name: "profileData.deptOfLaborEin", path: ["profileData", "deptOfLaborEin"] },
  {
    name: "cigaretteLicenseData.encryptedTaxId",
    path: ["cigaretteLicenseData", "encryptedTaxId"],
  },
  {
    name: "taxClearanceCertificateData.encryptedTaxId",
    path: ["taxClearanceCertificateData", "encryptedTaxId"],
  },
  {
    name: "taxClearanceCertificateData.encryptedTaxPin",
    path: ["taxClearanceCertificateData", "encryptedTaxPin"],
  },
];

const usage = (): string => `Usage:
  AWS_PROFILE=<aws-profile> yarn workspace @businessnjgovnavigator/api tsx \\
    scripts/reportKmsQuarantinedUsers.ts \\
    --table <users-table> \\
    --function-name <migrate-users-lambda> \\
    [--region <aws-region>]

Example:
  AWS_PROFILE=Innov-Prod yarn workspace @businessnjgovnavigator/api tsx \\
    scripts/reportKmsQuarantinedUsers.ts \\
    --table users-table-prod \\
    --function-name businessnjgov-api-v2-prod-migrateUsersVersion

This command only reads Lambda configuration and performs an eventually consistent DynamoDB scan.
The Markdown report is written to stdout; progress is written to stderr.
`;

const readOption = (args: readonly string[], name: string): string | undefined => {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }

  return value;
};

const parseOptions = (args: readonly string[]): ScriptOptions | undefined => {
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(usage());
    return undefined;
  }

  const tableName = readOption(args, "--table");
  const functionName = readOption(args, "--function-name");
  if (!tableName || !functionName) {
    throw new Error(`--table and --function-name are required\n\n${usage()}`);
  }

  return {
    tableName,
    functionName,
    region: readOption(args, "--region") ?? "us-east-1",
  };
};

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readPath = (source: Readonly<Record<string, unknown>>, path: readonly string[]): unknown => {
  let current: unknown = source;
  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
};

const escapeTableCell = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll("|", "\\|").replaceAll(/\r?\n/g, " ");

const codeTableCell = (value: string): string =>
  `\`${escapeTableCell(value).replaceAll("`", "'")}\``;

const renderReport = ({
  findings,
  profile,
  tableName,
  functionName,
  scannedCount,
  outdatedCount,
}: {
  readonly findings: readonly QuarantineFinding[];
  readonly profile: string;
  readonly tableName: string;
  readonly functionName: string;
  readonly scannedCount: number;
  readonly outdatedCount: number;
}): string => {
  const sortedFindings = [...findings].sort(
    (left, right) =>
      left.userId.localeCompare(right.userId) ||
      left.fieldName.localeCompare(right.fieldName) ||
      left.reason.localeCompare(right.reason),
  );
  const affectedUsers = new Set(sortedFindings.map(({ userId }) => userId)).size;
  const reasonCounts = new Map<string, number>();
  for (const finding of sortedFindings) {
    reasonCounts.set(finding.reason, (reasonCounts.get(finding.reason) ?? 0) + 1);
  }

  const lines = [
    "# Prod KMS Quarantine Candidates",
    "",
    "> Sensitive operational data: this report may contain user IDs and email addresses. Do not commit it or share it outside authorized remediation work.",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Source: AWS profile ${codeTableCell(profile)}, table ${codeTableCell(tableName)}, Lambda configuration ${codeTableCell(functionName)}.`,
    "",
    `Read-only scan: ${scannedCount} records scanned; ${outdatedCount} records below version ${CURRENT_VERSION} inspected.`,
    "",
    "This report identifies ciphertext metadata that the deployed production quarantine policy would reject. It does not decrypt ciphertext or invoke migrations. A user with multiple offending fields may have multiple rows.",
    "",
    "| User ID | Email address | Offending field | Quarantine reason |",
    "| --- | --- | --- | --- |",
    ...sortedFindings.map(
      ({ userId, email, fieldName, reason }) =>
        `| ${codeTableCell(userId)} | ${codeTableCell(email)} | ${codeTableCell(fieldName)} | ${escapeTableCell(reason)} |`,
    ),
    "",
    "## Summary",
    "",
    `Affected users: ${affectedUsers}`,
    "",
    `Offending fields: ${sortedFindings.length}`,
    "",
    "| Reason | Fields |",
    "| --- | ---: |",
    ...[...reasonCounts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([reason, count]) => `| ${escapeTableCell(reason)} | ${count} |`),
    `| **Total** | **${sortedFindings.length}** |`,
    "",
  ];

  return lines.join("\n");
};

const main = async (): Promise<void> => {
  const options = parseOptions(process.argv.slice(2));
  if (!options) {
    return;
  }

  const profile = process.env.AWS_PROFILE;
  if (!profile) {
    throw new Error("AWS_PROFILE is required so the target account is explicit");
  }

  const lambdaClient = new LambdaClient({ region: options.region });
  const dynamoDbClient = new DynamoDBClient({ region: options.region });

  // This tool intentionally permits only configuration reads and eventually consistent scans.
  const lambdaConfiguration = await lambdaClient.send(
    new GetFunctionConfigurationCommand({ FunctionName: options.functionName }),
  );
  const environment = lambdaConfiguration.Environment?.Variables ?? {};
  const stage = environment.STAGE ?? "";
  const cryptoContextStage = environment.AWS_CRYPTO_CONTEXT_STAGE ?? "";
  const cryptoContextPurpose = environment.AWS_CRYPTO_CONTEXT_TAX_ID_ENCRYPTION_PURPOSE ?? "";
  const cryptoContextOrigin = environment.AWS_CRYPTO_CONTEXT_ORIGIN ?? "";
  const currentKey = environment.AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY ?? "";
  const legacyKey = environment.LEGACY_AWS_CRYPTO_TAX_ID_ENCRYPTION_KEY ?? "";
  const policy = resolveForeignEnvironmentPolicy({ stage, cryptoContextStage });

  if (stage !== "prod" || policy !== "quarantine") {
    throw new Error(
      `Refusing to report against ${options.functionName}: expected the deployed production quarantine policy`,
    );
  }
  if (!cryptoContextPurpose || !cryptoContextOrigin || !currentKey) {
    throw new Error(
      `Refusing to report against ${options.functionName}: required encryption configuration is missing`,
    );
  }

  const validationOptions = {
    allowedKeyIds: [currentKey, legacyKey].filter(Boolean),
    acceptedContexts: [
      {
        stage: cryptoContextStage,
        purpose: cryptoContextPurpose,
        origin: cryptoContextOrigin,
      },
    ],
    foreignEnvironmentPolicy: policy,
  } as const;

  const findings = new Map<string, QuarantineFinding>();
  let lastEvaluatedKey: ScanCommandOutput["LastEvaluatedKey"];
  let scannedCount = 0;
  let outdatedCount = 0;
  let nextProgressCount = 10_000;

  do {
    const page = await dynamoDbClient.send(
      new ScanCommand({
        TableName: options.tableName,
        ConsistentRead: false,
        ProjectionExpression: "userId,#data",
        FilterExpression: "#data.#version < :currentVersion",
        ExpressionAttributeNames: {
          "#data": "data",
          "#version": "version",
        },
        ExpressionAttributeValues: {
          ":currentVersion": { N: String(CURRENT_VERSION) },
        },
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    scannedCount += page.ScannedCount ?? 0;
    outdatedCount += page.Count ?? 0;
    for (const rawItem of page.Items ?? []) {
      const item = unmarshall(rawItem);
      const data = isRecord(item.data) ? item.data : {};
      const user = isRecord(data.user) ? data.user : {};
      const businesses = isRecord(data.businesses) ? Object.values(data.businesses) : [];
      const userId = typeof item.userId === "string" ? item.userId : "(missing user ID)";
      const email = typeof user.email === "string" ? user.email : "(missing email)";

      for (const businessValue of businesses) {
        if (!isRecord(businessValue)) {
          continue;
        }

        for (const field of encryptedFields) {
          const encryptedValue = readPath(businessValue, field.path);
          if (!encryptedValue) {
            continue;
          }

          let reason: string | undefined;
          if (typeof encryptedValue === "string") {
            try {
              validateCiphertextMetadata(encryptedValue, validationOptions);
            } catch (error) {
              if (error instanceof QuarantinedCiphertextError) {
                reason = error.message;
              } else {
                throw error;
              }
            }
          } else {
            reason = "Ciphertext header is malformed";
          }

          if (reason) {
            const finding = { userId, email, fieldName: field.name, reason };
            findings.set(JSON.stringify(finding), finding);
          }
        }
      }
    }

    lastEvaluatedKey = page.LastEvaluatedKey;
    if (scannedCount >= nextProgressCount || !lastEvaluatedKey) {
      console.error(
        `Scanned ${scannedCount} records; inspected ${outdatedCount} outdated records; found ${findings.size} offending fields`,
      );
      nextProgressCount = Math.floor(scannedCount / 10_000 + 1) * 10_000;
    }
  } while (lastEvaluatedKey);

  process.stdout.write(
    renderReport({
      findings: [...findings.values()],
      profile,
      tableName: options.tableName,
      functionName: options.functionName,
      scannedCount,
      outdatedCount,
    }),
  );
};

// The API workspace compiles scripts as CommonJS, which does not support top-level await.
// eslint-disable-next-line unicorn/prefer-top-level-await
void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`KMS quarantine report failed: ${message}`);
  process.exitCode = 1;
});
