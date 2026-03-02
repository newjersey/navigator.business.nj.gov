import { PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import { STAGE } from "@functions/config";
import { LogWriter, LogWriterType } from "@libs/logWriter";

export const handler = async (): Promise<void> => {
  const logger = LogWriter(`NavigatorWebService/${STAGE}`, "ApiLogs");
  const intercomMacrosBucketName = process.env.INTERCOM_MACROS_BUCKET;

  const intercomMacros = await createIntercomMacrosObj(logger);
  const client = new S3Client({});
  await uploadToS3(client, intercomMacros, intercomMacrosBucketName);
};

interface IntercomMacro {
  type: string;
  id: string;
  name: string;
  body: string;
  body_text: string;
  created_at: string;
  updated_at: string;
  visible_to: string;
  visible_to_team_ids: string[];
  available_on: string[];
}

interface Pages {
  type: string;
  per_page: number;
  next: {
    starting_after: string;
  };
}

interface IntercomMacrosListResponse {
  type: string;
  data: IntercomMacro[];
  pages: Pages;
}

const removeNewLines = (text: string): string => {
  return text.replaceAll("\n", "");
};

const removeNonAsciiCharacters = (text: string): string => {
  return text.replaceAll(/[^\u0020-\u007E]/g, "");
};

const containsDynamicPhrase = (text: string): boolean => {
  const regex = /{{[^}]+}}/;
  return regex.test(text);
};

const sanitizeText = (text: string): string => {
  text = removeNewLines(text);
  text = removeNonAsciiCharacters(text);
  return text;
};

const formatMacrosIntoJson = (intercomObjs: IntercomMacro[]): Record<string, string> => {
  const macrosMap: Record<string, string> = {};
  for (const macro of intercomObjs) {
    if (!containsDynamicPhrase(macro.body_text))
      macrosMap[sanitizeText(macro.name)] = sanitizeText(macro.body_text);
  }
  return macrosMap;
};

const fetchMarcosListFromIntercom = async (
  startAfterCursor: string,
): Promise<{
  intercomObjs: Record<string, string>;
  startAfterCursor?: string;
}> => {
  const startingTime = "1577865600"; // January 1, 2020
  const response = await fetch(
    `${process.env.INTERCOM_MACROS_BASE_URL}?per_page=50&starting_after=${startAfterCursor}&updated_since=${startingTime}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.INTERCOM_TOKEN}`,
        Accept: "application/json",
        "Intercom-Version": "Unstable",
      },
    },
  );
  const data = (await response.json()) as IntercomMacrosListResponse;
  return {
    intercomObjs: formatMacrosIntoJson(data.data),
    startAfterCursor: data.pages?.next?.starting_after,
  };
};

const createIntercomMacrosObj = async (logger: LogWriterType): Promise<Record<string, string>> => {
  try {
    let macrosObject: Record<string, string> = {};

    const initialResponse = await fetchMarcosListFromIntercom("");
    macrosObject = { ...macrosObject, ...initialResponse.intercomObjs };
    let startAfterCursor = initialResponse.startAfterCursor;

    while (startAfterCursor) {
      const result = await fetchMarcosListFromIntercom(startAfterCursor);
      startAfterCursor = result.startAfterCursor;
      macrosObject = { ...macrosObject, ...result.intercomObjs };
    }

    logger.LogInfo(`Successfully fetched data ${Object.keys(macrosObject).length} macros`);
    return macrosObject;
  } catch (error) {
    logger.LogError(`Failed to fetch from Intercom: ${error}`);
    throw error;
  }
};

const uploadToS3 = async (
  client: S3Client,
  intercomMacros: Record<string, string>,
  bucketName: string | undefined,
): Promise<void> => {
  try {
    const response = await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: "intercom-macros.json",
        Body: JSON.stringify(intercomMacros),
      }),
    );
    console.log(response);
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === "EntityTooLarge") {
      console.error(
        `Error from S3 while uploading object to ${bucketName}. The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) or the multipart upload API (5TB max).`,
      );
    } else if (error instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${bucketName}.  ${error.name}: ${error.message}`,
      );
    } else {
      throw error;
    }
  }
};
