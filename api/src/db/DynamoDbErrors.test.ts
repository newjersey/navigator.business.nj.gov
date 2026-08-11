import {
  getDynamoDbItemSizeBucket,
  isDynamoDbThrottlingError,
  toDatabaseThrottlingError,
} from "@db/DynamoDbErrors";
import { DatabaseThrottlingError } from "@domain/types";

describe("DynamoDbErrors", () => {
  it.each([
    { name: "ProvisionedThroughputExceededException" },
    { name: "RequestLimitExceeded" },
    { name: "ThrottlingException" },
    { $retryable: { throttling: true } },
    { $metadata: { httpStatusCode: 429 } },
    {
      name: "TransactionCanceledException",
      CancellationReasons: [{ Code: "None" }, { Code: "ThrottlingError" }],
    },
    {
      name: "TransactionCanceledException",
      CancellationReasons: [{ Code: "ProvisionedThroughputExceeded" }],
    },
  ])("recognizes a DynamoDB throttling response: %#", (error) => {
    expect(isDynamoDbThrottlingError(error)).toBe(true);
  });

  it("recognizes a throttling response nested in an error cause", () => {
    const error = new Error("Database operation failed", {
      cause: { name: "ThrottlingException" },
    });

    expect(isDynamoDbThrottlingError(error)).toBe(true);
  });

  it.each([
    { name: "AccessDeniedException" },
    {
      name: "TransactionCanceledException",
      CancellationReasons: [{ Code: "ConditionalCheckFailed" }],
    },
    {
      name: "TransactionCanceledException",
      CancellationReasons: [{ Code: "TransactionConflict" }],
    },
  ])("does not classify a non-throttling response as throttling: %#", (error) => {
    expect(isDynamoDbThrottlingError(error)).toBe(false);
  });

  it("preserves safe write context without exposing the source error message", () => {
    const sourceError = new Error("sensitive SDK details");

    const result = toDatabaseThrottlingError(sourceError, {
      operation: "put-user",
      itemSizeBucket: "300-399-kb",
    });

    expect(result).toBeInstanceOf(DatabaseThrottlingError);
    expect(result.message).toBe("Database write capacity is temporarily unavailable");
    expect(result.context).toEqual({
      operation: "put-user",
      itemSizeBucket: "300-399-kb",
    });
    expect(result.cause).toBe(sourceError);
  });

  it.each([
    [99, "under-100-kb"],
    [150, "100-199-kb"],
    [250, "200-299-kb"],
    [350, "300-399-kb"],
    [450, "400-kb-or-more"],
  ])("buckets an approximately %i KB item as %s", (kilobytes, expectedBucket) => {
    expect(getDynamoDbItemSizeBucket({ value: "x".repeat(kilobytes * 1024) })).toBe(expectedBucket);
  });
});
