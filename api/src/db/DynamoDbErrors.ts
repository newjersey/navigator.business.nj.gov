import {
  type DatabaseItemSizeBucket,
  DatabaseThrottlingError,
  type DatabaseThrottlingContext,
} from "@domain/types";

const throttlingErrorNames = new Set([
  "ProvisionedThroughputExceededException",
  "RequestLimitExceeded",
  "ThrottlingException",
]);

const throttlingCancellationCodes = new Set(["ProvisionedThroughputExceeded", "ThrottlingError"]);

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null;

const hasThrottlingCancellationReason = (error: Readonly<Record<string, unknown>>): boolean => {
  if (error.name !== "TransactionCanceledException" || !Array.isArray(error.CancellationReasons)) {
    return false;
  }

  return error.CancellationReasons.some(
    (reason) =>
      isRecord(reason) &&
      typeof reason.Code === "string" &&
      throttlingCancellationCodes.has(reason.Code),
  );
};

const isSingleDynamoDbThrottlingError = (error: unknown): boolean => {
  if (!isRecord(error)) {
    return false;
  }

  if (typeof error.name === "string" && throttlingErrorNames.has(error.name)) {
    return true;
  }

  if (hasThrottlingCancellationReason(error)) {
    return true;
  }

  const retryable = error.$retryable;
  if (isRecord(retryable) && retryable.throttling === true) {
    return true;
  }

  const metadata = error.$metadata;
  return isRecord(metadata) && metadata.httpStatusCode === 429;
};

export const isDynamoDbThrottlingError = (error: unknown): boolean => {
  const visited = new Set<unknown>();
  let current: unknown = error;

  while (current && !visited.has(current)) {
    if (current instanceof DatabaseThrottlingError || isSingleDynamoDbThrottlingError(current)) {
      return true;
    }

    visited.add(current);
    current = isRecord(current) ? current.cause : undefined;
  }

  return false;
};

export const getDynamoDbItemSizeBucket = (item: unknown): DatabaseItemSizeBucket => {
  const approximateBytes = Buffer.byteLength(JSON.stringify(item) ?? "");
  const approximateKilobytes = approximateBytes / 1024;

  if (approximateKilobytes < 100) {
    return "under-100-kb";
  }
  if (approximateKilobytes < 200) {
    return "100-199-kb";
  }
  if (approximateKilobytes < 300) {
    return "200-299-kb";
  }
  if (approximateKilobytes < 400) {
    return "300-399-kb";
  }
  return "400-kb-or-more";
};

export const toDatabaseThrottlingError = (
  error: unknown,
  context: DatabaseThrottlingContext,
): DatabaseThrottlingError => {
  if (error instanceof DatabaseThrottlingError) {
    return error;
  }

  return new DatabaseThrottlingError(context, { cause: error });
};
