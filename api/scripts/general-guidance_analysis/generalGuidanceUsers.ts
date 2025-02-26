/**
 * Storing this file in api/scripts/ for record keeping purposes.
 * */

// @ts-nocheck

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const userIds = [];

export const marshallOptions = {
  // Whether to automatically convert empty strings, blobs, and sets to `null`.
  convertEmptyValues: false, // false, by default.
  // Whether to remove undefined values while marshalling.
  removeUndefinedValues: true, // false, by default.
  // Whether to convert typeof object to map attribute.
  convertClassInstanceToMap: false, // false, by default.
};

export const unmarshallOptions = {
  // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
  wrapNumbers: false, // false, by default.
};

export const dynamoDbTranslateConfig = { marshallOptions, unmarshallOptions };

interface BusinessProfile {
  environmentData: {
    air?: {
      questionnaireData: {
        noAir: boolean;
      };
      submitted: boolean;
    };
    waste?: {
      questionnaireData: {
        noWaste: boolean;
      };
      submitted: boolean;
    };
    land?: {
      questionnaireData: {
        noLand: boolean;
      };
      submitted: boolean;
    };
  };
}

interface User {
  userId?: string;
  data?: {
    businesses?: Record<string, BusinessProfile>;
  };
}

async function generalGuidanceUser(directory: string): Promise<void> {
  const db = DynamoDBDocumentClient.from(
    new DynamoDBClient({
      region: "[REGION]",
    }),
    dynamoDbTranslateConfig
  );

  const tableName = "[TABLE NAME]";

  const results = [];

  for (const userId of userIds) {
    const params = {
      TableName: tableName,
      Key: {
        userId: userId,
      },
    };

    db.send(new GetCommand(params))
      .then(async (result) => {
        if (!result.Item) {
          console.log(`User with ID ${userId} not found in table ${tableName}`);
        } else {
          const obj = {
            email: result.Item.data.user.email,
            userTesting: result.Item.data.user.userTesting,
          };

          const businesses = Object.values(result.Item.data.businesses);
          const bizData = businesses.map((biz) => {
            if (biz.profileData.industryId === "generic") {
              return {
                userId: userId,
                industryId: biz.profileData.industryId,
                naicsCode: biz.profileData.naicsCode,
                wasteSubmitted: biz.environmentData?.waste?.submitted,
                wasteApplicable:
                  biz.environmentData?.waste?.submitted &&
                  biz.environmentData?.waste?.questionnaireData.noWaste !== true,
                landSubmitted: biz.environmentData?.land?.submitted,
                landApplicable:
                  biz.environmentData?.land?.submitted &&
                  biz.environmentData?.land?.questionnaireData.noLand !== true,
                airSubmited: biz.environmentData?.air?.submitted,
                airApplicable:
                  biz.environmentData?.air?.submitted &&
                  biz.environmentData?.air?.questionnaireData.noAir !== true,
              };
            }
          });

          obj["bizData"] = bizData;

          console.log(obj);
        }
      })
      .catch((error) => {
        throw error;
      });
  }
}

generalGuidanceUser();
