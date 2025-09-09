#!/usr/bin/env node

/**
 * Fixes S3 document paths containing "undefined" in business records
 *
 * This script identifies businesses with document URLs containing "undefined" in the path,
 * retrieves the correct user identity ID from Cognito, moves the S3 objects to proper
 * user-specific paths, and updates DynamoDB records with the corrected URLs.
 *
 * Usage: Set DOCUMENT_TYPE to target specific document types and optionally set
 * SPECIFIC_BUSINESS_ID to process a single business.
 */

import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { CopyObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { writeFileSync } from "fs";
import path from "path";

const DOCUMENT_TYPE = "formationDoc"; // "formationDoc" || "certifiedDoc" || "standingDoc"
const BUSINESS_DYNAMO_TABLE_NAME = "businesses-table-prod";
const USER_DYNAMO_TABLE_NAME = "users-table-prod";
const COGNITO_USER_POOL_ID = "user-pool-id";
const S3_BUCKET_NAME = "nj-bfs-user-documents-prod";
const AWS_REGION = "us-east-1";
const SPECIFIC_BUSINESS_ID = ""; // if this is defined, the script will only update this specific business

const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

async function findAffectedBusinesses() {
  console.log("Starting scan for businesses with undefined document paths...");

  const affectedBusinesses = [];
  let lastEvaluatedKey = undefined;
  const maxRetries = 5;

  let totalItemsScanned = 0;
  let batchesProcessed = 0;
  let startTime = Date.now();

  do {
    let retries = 0;
    let success = false;

    while (!success && retries < maxRetries) {
      try {
        const params = {
          TableName: BUSINESS_DYNAMO_TABLE_NAME,
          ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey }),
          Limit: 25,
        };

        const response = await docClient.send(new ScanCommand(params));
        success = true;

        const items = response.Items || [];
        totalItemsScanned += items.length;
        batchesProcessed++;

        for (const item of items) {
          try {
            const business = unmarshall(item);
            const docUrl = business?.data?.profileData?.documents?.[DOCUMENT_TYPE];
            if (docUrl && docUrl.includes("undefined")) {
              affectedBusinesses.push(business);
              console.log(
                `Found affected business: ${business.businessId} - ${
                  business.data?.profileData?.businessName || "unnamed"
                }`,
              );
            }
          } catch (error) {
            continue;
          }
        }

        lastEvaluatedKey = response.LastEvaluatedKey;
      } catch (error) {
        if (error.name === "ProvisionedThroughputExceededException") {
          retries++;
          const delay = Math.pow(2, retries) * 100; // Exponential backoff
          console.log(
            `Throughput exceeded. Retrying in ${delay}ms (attempt ${retries}/${maxRetries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`Error scanning DynamoDB table: ${error}`);
          break;
        }
      }
    }

    if (!success) {
      console.error("Maximum retries reached, stopping scan");
      break;
    }

    if (batchesProcessed % 10 === 0) {
      const elapsedMinutes = ((Date.now() - startTime) / 60000).toFixed(2);
      const scanRate = (totalItemsScanned / elapsedMinutes).toFixed(2);
      console.log(`
----- PROGRESS SUMMARY -----
Total batches processed: ${batchesProcessed}
Total items scanned: ${totalItemsScanned}
Affected businesses found: ${affectedBusinesses.length}
Scan rate: ~${scanRate} items/minute
Elapsed time: ${elapsedMinutes} minutes
---------------------------`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  } while (lastEvaluatedKey);

  const totalTimeMinutes = ((Date.now() - startTime) / 60000).toFixed(2);
  console.log(`
===== SCAN COMPLETE =====
Total time: ${totalTimeMinutes} minutes
Total items scanned: ${totalItemsScanned}
Found ${affectedBusinesses.length} businesses with undefined document paths
======================`);

  return affectedBusinesses;
}

async function getBusinessById(businessId) {
  try {
    const params = {
      TableName: BUSINESS_DYNAMO_TABLE_NAME,
      Key: {
        businessId: { S: businessId },
      },
    };

    const response = await dynamoClient.send(new GetItemCommand(params));

    if (!response.Item) {
      console.log(`Business with ID ${businessId} not found`);
      return [];
    }

    const business = unmarshall(response.Item);
    const docUrl = business?.data?.profileData?.documents?.[DOCUMENT_TYPE];
    if (!docUrl || !docUrl.includes("undefined")) {
      console.log(
        `Business ${businessId} is not affected (no document URL or no 'undefined' in URL)`,
      );
      return [];
    }

    return [business];
  } catch (error) {
    console.error(`Error getting business from DynamoDB: ${error}`);
    return [];
  }
}

function exportToCSV(data, filename = "affected-businesses.csv") {
  try {
    const rows = data.map((business) => ({
      businessId: business.businessId,
      userId: business.data?.userId || "",
      businessName: business.data?.profileData?.businessName || "",
      documentUrl: business.data?.profileData?.documents?.[DOCUMENT_TYPE] || "",
    }));

    if (rows.length === 0) {
      console.log("No data to export to CSV");
      return;
    }

    const headers = Object.keys(rows[0]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            return value.toString().includes(",") ? `"${value}"` : value;
          })
          .join(","),
      ),
    ].join("\n");

    writeFileSync(path.join(process.cwd(), filename), csvContent);
    console.log(`Successfully exported data to ${filename}`);
  } catch (error) {
    console.error(`Error exporting to CSV: ${error}`);
  }
}

async function getUserCustomIdentityId(userId) {
  try {
    const params = {
      UserPoolId: COGNITO_USER_POOL_ID,
      Username: `myNJ_${userId}`,
    };

    const response = await cognitoClient.send(new AdminGetUserCommand(params));

    const customIdentityAttribute = response?.UserAttributes.find(
      (el) => el.Name === "custom:identityId",
    );

    const customIdentityId = customIdentityAttribute?.Value;

    if (!customIdentityId) {
      return null;
    }

    return customIdentityId;
  } catch (error) {
    console.error(`Error getting user: ${error}`);
    return null;
  }
}

async function moveS3Object(sourceKey, destKey) {
  try {
    const copyParams = {
      Bucket: S3_BUCKET_NAME,
      CopySource: `${S3_BUCKET_NAME}/${sourceKey}`,
      Key: destKey,
    };
    const deleteParams = {
      Bucket: S3_BUCKET_NAME,
      Key: sourceKey,
    };

    await s3Client.send(new CopyObjectCommand(copyParams));
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    console.error(`Error moving S3 object: ${error}`);
    return false;
  }
}

async function updateBusinessDocumentUrl(businessId, userId, newUrl) {
  try {
    const userParams = {
      TableName: USER_DYNAMO_TABLE_NAME,
      Key: {
        userId: { S: userId },
      },
      ExpressionAttributeNames: {
        "#data": "data",
        "#businesses": "businesses",
        "#businessId": businessId,
        "#profileData": "profileData",
        "#documents": "documents",
        "#docUrl": DOCUMENT_TYPE,
      },
      ExpressionAttributeValues: {
        ":url": { S: newUrl },
      },
      UpdateExpression: "SET #data.#businesses.#businessId.#profileData.#documents.#docUrl = :url",
    };

    const businessParams = {
      TableName: BUSINESS_DYNAMO_TABLE_NAME,
      Key: {
        businessId: { S: businessId },
      },
      ExpressionAttributeNames: {
        "#data": "data",
        "#profileData": "profileData",
        "#documents": "documents",
        "#docUrl": DOCUMENT_TYPE,
      },
      ExpressionAttributeValues: {
        ":url": { S: newUrl },
      },
      UpdateExpression: "SET #data.#profileData.#documents.#docUrl = :url",
    };

    await dynamoClient.send(new UpdateItemCommand(userParams));
    await dynamoClient.send(new UpdateItemCommand(businessParams));
    return true;
  } catch (error) {
    console.error(`Error updating business: ${error}`);
    return false;
  }
}

async function main() {
  try {
    const now = new Date();
    const utcDateTimeISO = now.toISOString();

    // Find specific business or all affected businesses
    const businesses =
      SPECIFIC_BUSINESS_ID !== ""
        ? await getBusinessById(SPECIFIC_BUSINESS_ID)
        : await findAffectedBusinesses();

    console.log(`Found ${businesses.length} affected businesses`);

    if (!SPECIFIC_BUSINESS_ID) {
      exportToCSV(businesses, `affected-businesses-${DOCUMENT_TYPE}-${utcDateTimeISO}.csv`);
    }

    // Counter for successful updates
    let successCount = 0;

    // Process each affected business
    for (const business of businesses) {
      try {
        const businessId = business.businessId;
        const userId = business.data?.userId;

        if (!userId) {
          console.log(`Business ${businessId} has no userId, skipping`);
          continue;
        }

        // Get the user's custom identity ID
        const customIdentityId = await getUserCustomIdentityId(userId);
        if (!customIdentityId) {
          console.log(`Couldn't find custom identity ID for user ${userId}, skipping`);
          continue;
        }

        // Get the current doc URL
        const docUrl = business.data?.profileData?.documents?.[DOCUMENT_TYPE];
        const docName = docUrl.split("/").pop() || "";
        if (!docName) {
          console.log(`${DOCUMENT_TYPE} name not found for Business ${businessId}, skipping`);
          continue;
        }

        // Construct the source and destination S3 keys
        const sourceKey = `undefined/${docName}`;
        const destKey = `${customIdentityId}/${docName}`;

        // move the S3 object to
        const moved = await moveS3Object(sourceKey, destKey);
        if (!moved) {
          console.log(`Failed to move S3 object for business ${businessId}, skipping`);
          continue;
        }

        // Update the DynamoDB entry
        const location = docUrl.split("/undefined/")[0];
        const newDocUrl = `${location}/${encodeURIComponent(customIdentityId)}/${docName}`;
        const udpatedBusiness = await updateBusinessDocumentUrl(businessId, userId, newDocUrl);
        if (udpatedBusiness) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing business ${business.businessId}: ${error}`);
      }
    }

    console.log(`Successfully updated ${successCount} out of ${businesses.length} businesses`);
  } catch (error) {
    console.error(`Script execution failed: ${error}`);
  }
}

main().catch(console.error);
