#!/usr/bin/env bash
set -euo pipefail

PROFILE=""
TABLE=""
REGION="us-east-1"
ACCEPTED_CONTEXTS=""
CURRENT_KEY=""
LEGACY_KEY=""

# Read-only commands used on 2026-08-06 to produce the Innov-Dev counts:
#
# api/scripts/audit-kms-key-usage.sh --profile Innov-Dev --table users-table-dev --accepted-context 'dev|tax_id_encryption|us-east-1' --current-key arn:aws:kms:us-east-1:534320591531:key/d8103e95-4796-4fe0-8f83-b11eb5e0068e --legacy-key arn:aws:kms:us-east-1:534320591531:key/f2a3691d-415b-4299-8490-e8d3ff2bdc1e
# api/scripts/audit-kms-key-usage.sh --profile Innov-Dev --table users-table-testing --accepted-context 'dev|tax_id_encryption|us-east-1' --accepted-context '|tax_id_encryption|' --current-key arn:aws:kms:us-east-1:534320591531:key/f2c905eb-e1d2-4a0e-9922-dc157c43f568 --legacy-key arn:aws:kms:us-east-1:534320591531:key/e581302b-82ea-4875-a191-c19dd63f4fee
# api/scripts/audit-kms-key-usage.sh --profile Innov-Dev --table users-table-content --accepted-context 'dev|tax_id_encryption|us-east-1' --current-key arn:aws:kms:us-east-1:534320591531:key/fa1ad029-97c0-456f-88fb-11cd8def2238 --legacy-key arn:aws:kms:us-east-1:534320591531:key/12c3c41e-dc66-4e04-9660-260547c94e72

usage() {
  cat <<'EOF'
Usage:
  audit-kms-key-usage.sh \
    --profile <aws-profile> \
    --table <users-table> \
    --accepted-context '<stage>|<purpose>|<origin>' \
    [--accepted-context '<stage>|<purpose>|<origin>' ...] \
    --current-key <kms-key-arn> \
    [--legacy-key <kms-key-arn>] \
    [--region <aws-region>]

Examples:
  api/scripts/audit-kms-key-usage.sh \
    --profile Innov-Dev \
    --table users-table-dev \
    --accepted-context 'dev|tax_id_encryption|us-east-1' \
    --current-key <dev-kms-key-arn>

  api/scripts/audit-kms-key-usage.sh \
    --profile Innov-Dev \
    --table users-table-testing \
    --accepted-context 'dev|tax_id_encryption|us-east-1' \
    --accepted-context '|tax_id_encryption|' \
    --current-key <testing-kms-key-arn>
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --table)
      TABLE="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --accepted-context)
      if [[ -n "$ACCEPTED_CONTEXTS" ]]; then
        ACCEPTED_CONTEXTS+=$'\n'
      fi
      ACCEPTED_CONTEXTS+="$2"
      shift 2
      ;;
    --current-key)
      CURRENT_KEY="$2"
      shift 2
      ;;
    --legacy-key)
      LEGACY_KEY="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$PROFILE" || -z "$TABLE" || -z "$ACCEPTED_CONTEXTS" || -z "$CURRENT_KEY" ]]; then
  usage >&2
  exit 1
fi

NODE_SCRIPT=$(cat <<'NODE'
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const { deserializeFactory } = require("@aws-crypto/serialize");
const { NodeAlgorithmSuite } = require("@aws-crypto/material-management-node");

const { deserializeMessageHeader } = deserializeFactory(
  (input) => new TextDecoder().decode(input),
  NodeAlgorithmSuite,
);
const acceptedContexts = process.env.ACCEPTED_CONTEXTS.split("\n").map((serializedContext) => {
  const values = serializedContext.split("|");
  if (values.length !== 3) {
    throw new Error(
      `Invalid accepted context ${JSON.stringify(serializedContext)}; expected stage|purpose|origin`,
    );
  }

  const [stage, purpose, origin] = values;
  return { stage, purpose, origin };
});
const acceptedStages = new Set(acceptedContexts.map(({ stage }) => stage));
const currentKey = process.env.CURRENT_KEY;
const legacyKey = process.env.LEGACY_KEY;
const allowedKeyIds = new Set([currentKey, legacyKey].filter(Boolean));
const contextMatches = (actualContext, expectedContext) =>
  Object.entries(expectedContext).every(([key, value]) => actualContext[key] === value);
const classify = (context, keyArns) => {
  const contextIsAccepted = acceptedContexts.some((acceptedContext) =>
    contextMatches(context, acceptedContext),
  );
  if (!contextIsAccepted) {
    return typeof context.stage === "string" && !acceptedStages.has(context.stage)
      ? "foreign-context"
      : "unknown-context";
  }

  if (!keyArns.some((keyArn) => allowedKeyIds.has(keyArn))) {
    return "unknown-key";
  }

  return keyArns.includes(currentKey) ? "current" : "legacy";
};
const fields = [
  ["profileData.encryptedTaxId", (business) => business.profileData?.encryptedTaxId],
  ["profileData.encryptedTaxPin", (business) => business.profileData?.encryptedTaxPin],
  ["profileData.deptOfLaborEin", (business) => business.profileData?.deptOfLaborEin],
  [
    "cigaretteLicenseData.encryptedTaxId",
    (business) => business.cigaretteLicenseData?.encryptedTaxId,
  ],
  [
    "taxClearanceCertificateData.encryptedTaxId",
    (business) => business.taxClearanceCertificateData?.encryptedTaxId,
  ],
  [
    "taxClearanceCertificateData.encryptedTaxPin",
    (business) => business.taxClearanceCertificateData?.encryptedTaxPin,
  ],
];

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  const groups = new Map();
  const summaries = new Map();
  const add = (metadata, userId) => {
    const key = JSON.stringify(metadata);
    const group = groups.get(key) ?? { fields: 0, users: new Set() };
    group.fields += 1;
    group.users.add(userId);
    groups.set(key, group);

    const summary = summaries.get(metadata.status) ?? { fields: 0, users: new Set() };
    summary.fields += 1;
    summary.users.add(userId);
    summaries.set(metadata.status, summary);
  };

  for (const rawItem of JSON.parse(input).Items ?? []) {
    const item = unmarshall(rawItem);
    for (const business of Object.values(item.data?.businesses ?? {})) {
      for (const [fieldName, getValue] of fields) {
        const encryptedValue = getValue(business);
        if (!encryptedValue) continue;

        try {
          const header = deserializeMessageHeader(Buffer.from(encryptedValue, "base64"));
          if (!header) throw new Error("Incomplete header");
          const context = header.messageHeader.encryptionContext;
          const keyArns = header.messageHeader.encryptedDataKeys.map((dataKey) =>
            dataKey.providerInfo.toString(),
          );
          const status = classify(context, keyArns);

          add(
            {
              status,
              keyArns,
              stage: context.stage ?? "",
              purpose: context.purpose ?? "",
              origin: context.origin ?? "",
              fieldName,
            },
            item.userId,
          );
        } catch {
          add(
            {
              status: "invalid",
              keyArns: [],
              stage: "",
              purpose: "",
              origin: "",
              fieldName,
            },
            item.userId,
          );
        }
      }
    }
  }

  console.log("scope,status,keyArns,stage,purpose,origin,fieldName,userCount,fieldCount");
  for (const [status, summary] of [...summaries.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    console.log(
      ["summary", status, "", "", "", "", "", summary.users.size, summary.fields]
        .map((value) => JSON.stringify(value))
        .join(","),
    );
  }

  for (const [key, group] of [...groups.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const metadata = JSON.parse(key);
    const values = [
      "detail",
      metadata.status,
      metadata.keyArns.join(";"),
      metadata.stage,
      metadata.purpose,
      metadata.origin,
      metadata.fieldName,
      group.users.size,
      group.fields,
    ];
    console.log(values.map((value) => JSON.stringify(value)).join(","));
  }
});
NODE
)

export ACCEPTED_CONTEXTS CURRENT_KEY LEGACY_KEY
AWS_PAGER="" aws dynamodb scan \
  --profile "$PROFILE" \
  --region "$REGION" \
  --table-name "$TABLE" \
  --projection-expression "userId,#data" \
  --expression-attribute-names '{"#data":"data"}' \
  --output json |
  node -e "$NODE_SCRIPT"
