import { createHash } from "node:crypto";
import * as https from "node:https";
import { PutObjectCommand, type PutObjectCommandOutput, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import axios, { type AxiosResponse } from "axios";
import { StatusCodes } from "http-status-codes";

export const uploadFile = async (
  fullName: string,
  fileContent: Buffer,
  fileType: string,
  bucket: string,
): Promise<PutObjectCommandOutput> => {
  const s3 = new S3Client({
    region: "us-east-1",
    requestHandler: new NodeHttpHandler({
      httpsAgent: new https.Agent({
        secureProtocol: "TLSv1_2_method",
      }),
    }),
  });
  const hashSum = createHash("md5");
  hashSum.update(fileContent);
  const params = {
    Key: fullName,
    Body: fileContent,
    Bucket: bucket,
    ContentEncoding: "binary",
    ContentType: fileType,
    ContentMD5: hashSum.digest("base64"),
  };
  const command = new PutObjectCommand(params);
  return s3.send(command);
};

export const getFileFromURL = async (URI: string): Promise<AxiosResponse<any, any>> =>
  new Promise((resolve, reject) => {
    try {
      axios
        .get(encodeURI(URI), {
          responseType: "arraybuffer",
        })
        .then((response) => {
          resolve(response);
        });
    } catch (error) {
      reject(error);
    }
  });

const escapeColons = (value: string): string => {
  const segments = value.split(":");
  if (segments.length === 1) {
    return value;
  }
  const initial = segments.shift();
  return [initial, segments.join("%3A")].join(":");
};

export const saveFileFromUrl = async (
  URI: string,
  fullName: string,
  bucket: string,
): Promise<string> =>
  new Promise((resolve, reject) => {
    getFileFromURL(URI)
      .then((object) => {
        uploadFile(
          fullName,
          object.data,
          String(object.headers["content-type"] ?? "application/octet-stream"),
          bucket,
        )
          .then((s3response) => {
            if (s3response.$metadata.httpStatusCode === StatusCodes.OK) {
              resolve(escapeColons(`https://${bucket}.s3.us-east-1.amazonaws.com/${fullName}`));
            } else {
              reject(s3response.$metadata.httpStatusCode);
            }
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
